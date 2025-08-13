import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';

// Initialize MMKV storage for tool data
const toolStorage = new MMKV({ id: 'tool-storage' });

interface ToolUsage {
  toolId: string;
  timestamp: Date;
  completed: boolean;
  duration?: number; // in seconds
}

interface ToolStats {
  totalUses: number;
  currentStreak: number;
  lastUsed?: Date;
  completionRate: number;
}

interface PledgeData {
  lastPledgeDate?: string;
  currentStreak: number;
  totalPledges: number;
  lastPledgeText?: string;
}

interface ToolStore {
  // Tool usage tracking
  toolUsages: ToolUsage[];
  
  // Pledge specific data
  pledgeData: PledgeData;
  
  // Actions
  recordToolUse: (toolId: string, duration?: number) => void;
  getToolStats: (toolId: string) => ToolStats;
  updatePledgeData: (data: Partial<PledgeData>) => void;
  getPledgeData: () => PledgeData;
  
  // Persistence
  loadFromStorage: () => void;
  clearData: () => void;
}

export const useToolStore = create<ToolStore>((set, get) => ({
  toolUsages: [],
  pledgeData: {
    currentStreak: 0,
    totalPledges: 0,
  },

  recordToolUse: (toolId, duration) => {
    const usage: ToolUsage = {
      toolId,
      timestamp: new Date(),
      completed: true,
      duration,
    };
    
    const newUsages = [...get().toolUsages, usage];
    set({ toolUsages: newUsages });
    
    // Persist to storage
    toolStorage.set('toolUsages', JSON.stringify(newUsages));
  },

  getToolStats: (toolId) => {
    const usages = get().toolUsages;
    
    if (toolId === 'all') {
      // Return aggregated stats for all tools
      const allStats: any = {};
      const toolIds = ['panic', 'urge-timer', 'breathwork', 'pledge'];
      
      toolIds.forEach(id => {
        allStats[id] = get().getToolStats(id);
      });
      
      return allStats;
    }
    
    const toolUsages = usages.filter(usage => usage.toolId === toolId);
    const totalUses = toolUsages.length;
    const completedUses = toolUsages.filter(usage => usage.completed).length;
    const completionRate = totalUses > 0 ? completedUses / totalUses : 0;
    
    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toDateString();
    const sortedUsages = toolUsages
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    for (const usage of sortedUsages) {
      const usageDate = new Date(usage.timestamp).toDateString();
      if (usageDate === today || isConsecutiveDay(usageDate, currentStreak)) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    const lastUsed = toolUsages.length > 0 ? 
      new Date(Math.max(...toolUsages.map(u => new Date(u.timestamp).getTime()))) : 
      undefined;

    return {
      totalUses,
      currentStreak,
      lastUsed,
      completionRate,
    };
  },

  updatePledgeData: (data) => {
    const newPledgeData = { ...get().pledgeData, ...data };
    set({ pledgeData: newPledgeData });
    toolStorage.set('pledgeData', JSON.stringify(newPledgeData));
  },

  getPledgeData: () => {
    return get().pledgeData;
  },

  loadFromStorage: async () => {
    try {
      const usagesString = toolStorage.getString('toolUsages');
      const usages = usagesString ? JSON.parse(usagesString) : [];
      
      // Parse timestamps
      const parsedUsages = usages.map((usage: any) => ({
        ...usage,
        timestamp: new Date(usage.timestamp),
      }));

      const pledgeString = toolStorage.getString('pledgeData');
      const pledgeData = pledgeString ? JSON.parse(pledgeString) : {
        currentStreak: 0,
        totalPledges: 0,
      };

      set({ 
        toolUsages: parsedUsages,
        pledgeData,
      });
    } catch (error) {
      console.error('Error loading tool data from storage:', error);
    }
  },

  clearData: () => {
    toolStorage.clearAll();
    set({
      toolUsages: [],
      pledgeData: {
        currentStreak: 0,
        totalPledges: 0,
      },
    });
  },
}));

// Helper function to check consecutive days
function isConsecutiveDay(dateString: string, streakCount: number): boolean {
  const date = new Date(dateString);
  const expectedDate = new Date();
  expectedDate.setDate(expectedDate.getDate() - streakCount - 1);
  return date.toDateString() === expectedDate.toDateString();
}