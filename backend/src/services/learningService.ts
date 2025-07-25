import mongoose from 'mongoose';
import { UserPerformance } from '../models/UserPerformance';
import { Session } from '../models/Session';
import { User } from '../models/User';
import { generateContentWithHistory } from '../llm';

export interface VarkModeStats {
  mode: 'V' | 'A' | 'R' | 'K';
  successRate: number;
  totalResponses: number;
}

export class LearningService {
  /**
   * Track user interaction and update performance data
   */
  static async trackInteraction(
    userId: string,
    mode: 'V' | 'A' | 'R' | 'K',
    isNegativeResponse: boolean
  ): Promise<void> {
    try {
      // Find or create UserPerformance document
      let userPerformance = await UserPerformance.findOne({ userId: new mongoose.Types.ObjectId(userId) });
      
      if (!userPerformance) {
        userPerformance = new UserPerformance({ userId: new mongoose.Types.ObjectId(userId) });
      }

      // Update the specific VARK mode performance
      const modeField = mode.toLowerCase() as 'visual' | 'auditory' | 'reading' | 'kinesthetic';
      userPerformance[modeField].countResponse += 1;
      
      if (isNegativeResponse) {
        userPerformance[modeField].countNegativeResponse += 1;
      }

      await userPerformance.save();
    } catch (error) {
      console.error('Error tracking interaction:', error);
      throw new Error('Failed to track user interaction');
    }
  }

  /**
   * Get user performance statistics for all VARK modes
   */
  static async getUserPerformanceStats(userId: string): Promise<VarkModeStats[]> {
    try {
      const userPerformance = await UserPerformance.findOne({ 
        userId: new mongoose.Types.ObjectId(userId) 
      });

      if (!userPerformance) {
        // Return default stats if no performance data exists
        return [
          { mode: 'V', successRate: 0, totalResponses: 0 },
          { mode: 'A', successRate: 0, totalResponses: 0 },
          { mode: 'R', successRate: 0, totalResponses: 0 },
          { mode: 'K', successRate: 0, totalResponses: 0 },
        ];
      }

      const modes = [
        { mode: 'V' as const, data: userPerformance.visual },
        { mode: 'A' as const, data: userPerformance.auditory },
        { mode: 'R' as const, data: userPerformance.reading },
        { mode: 'K' as const, data: userPerformance.kinesthetic },
      ];

      return modes.map(({ mode, data }) => ({
        mode,
        successRate: data.countResponse > 0 
          ? ((data.countResponse - data.countNegativeResponse) / data.countResponse) * 100
          : 0,
        totalResponses: data.countResponse,
      }));
    } catch (error) {
      console.error('Error getting user performance stats:', error);
      throw new Error('Failed to get user performance statistics');
    }
  }

  /**
   * Analyze if mode switch should be suggested based on performance
   */
  static async analyzeModeSwitch(
    userId: string, 
    currentMode: 'V' | 'A' | 'R' | 'K'
  ): Promise<{ shouldSwitch: boolean; suggestedMode?: 'V' | 'A' | 'R' | 'K'; message?: string }> {
    try {
      const stats = await this.getUserPerformanceStats(userId);
      const currentModeStats = stats.find(s => s.mode === currentMode);
      
      // Only suggest switch if current mode has enough data (at least 3 interactions)
      if (!currentModeStats || currentModeStats.totalResponses < 3) {
        return { shouldSwitch: false };
      }

      // If current mode success rate is below 60%, look for better alternatives
      if (currentModeStats.successRate < 60) {
        // Find the mode with the highest success rate (excluding current mode)
        const otherModes = stats.filter(s => s.mode !== currentMode && s.totalResponses > 0);
        
        if (otherModes.length === 0) {
          return { shouldSwitch: false };
        }

        const bestMode = otherModes.reduce((best, current) => 
          current.successRate > best.successRate ? current : best
        );

        // Only suggest switch if the best alternative is significantly better (at least 25% improvement)
        if (bestMode.successRate > currentModeStats.successRate + 25) {
          const modeNames = {
            'V': 'Visual',
            'A': 'Auditory', 
            'R': 'Reading/Writing',
            'K': 'Kinesthetic'
          };

          return {
            shouldSwitch: true,
            suggestedMode: bestMode.mode,
            message: `I notice you might learn better with ${modeNames[bestMode.mode]} mode. Would you like to switch? Your success rate with ${modeNames[bestMode.mode]} has been ${bestMode.successRate.toFixed(1)}% compared to ${currentModeStats.successRate.toFixed(1)}% with ${modeNames[currentMode]}.`
          };
        }
      }

      return { shouldSwitch: false };
    } catch (error) {
      console.error('Error analyzing mode switch:', error);
      return { shouldSwitch: false };
    }
  }

  /**
   * Process user response and generate AI reply with adaptive learning
   */
  static async processLearningInteraction(
    userId: string,
    sessionId: string,
    userInput: string,
    currentMode: 'V' | 'A' | 'R' | 'K',
    history?: string,
    fileContent?: string
  ): Promise<{
    aiResponse: string;
    isNegativeResponse: boolean;
    modeSuggestion?: { suggestedMode: 'V' | 'A' | 'R' | 'K'; message: string };
    kinestheticData?: any;
  }> {
    try {
      // Detect if user response indicates confusion or lack of understanding
      const negativeIndicators = [
        'tidak mengerti', 'kurang jelas', 'ulangi', 'hmm', 'hah', 'apa',
        "don't understand", "not clear", "repeat", "what", "confused",
        'bingung', 'gak paham', 'ga ngerti', 'susah', 'sulit'
      ];
      
      const isNegativeResponse = negativeIndicators.some(indicator => 
        userInput.toLowerCase().includes(indicator.toLowerCase())
      );

      // Track the interaction
      await this.trackInteraction(userId, currentMode, isNegativeResponse);

      // Get AI response with enhanced prompt that includes user performance data
      const userStats = await this.getUserPerformanceStats(userId);
      const aiResponse = await generateContentWithHistory(
        userInput, 
        currentMode, 
        history, 
        fileContent,
        userStats,
        isNegativeResponse
      );

      // Analyze if mode switch should be suggested
      const modeAnalysis = await this.analyzeModeSwitch(userId, currentMode);

      // Extract kinesthetic data if in K mode
      let kinestheticData;
      if (currentMode === 'K') {
        kinestheticData = await this.extractKinestheticData(aiResponse, sessionId);
      }

      return {
        aiResponse,
        isNegativeResponse,
        modeSuggestion: modeAnalysis.shouldSwitch 
          ? { suggestedMode: modeAnalysis.suggestedMode!, message: modeAnalysis.message! }
          : undefined,
        kinestheticData
      };
    } catch (error) {
      console.error('Error processing learning interaction:', error);
      throw new Error('Failed to process learning interaction');
    }
  }

  /**
   * Extract and store kinesthetic data from AI response
   */
  static async extractKinestheticData(aiResponse: string, sessionId: string): Promise<any> {
    try {
      // Parse the AI response to extract kinesthetic elements and drop zones
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return null;

      const commands = JSON.parse(jsonMatch[0]);
      const elements: any[] = [];
      const dropZones: any[] = [];

      commands.forEach((command: any) => {
        if (command.command === 'createDraggable') {
          elements.push({
            id: command.payload.id,
            text: command.payload.text || command.payload.src
          });
        } else if (command.command === 'setDropTarget') {
          dropZones.push({
            elementId: command.payload.correctComponentId,
            x: command.payload.x,
            y: command.payload.y,
            tolerance: 50 // Default tolerance
          });
        }
      });

      // Store kinesthetic data in session
      if (elements.length > 0 || dropZones.length > 0) {
        await Session.findByIdAndUpdate(sessionId, {
          kinestheticData: { elements, dropZones }
        });

        return { elements, dropZones };
      }

      return null;
    } catch (error) {
      console.error('Error extracting kinesthetic data:', error);
      return null;
    }
  }

  /**
   * Validate kinesthetic answer
   */
  static async validateKinestheticAnswer(
    sessionId: string,
    elementId: string,
    droppedCoordinates: { x: number; y: number }
  ): Promise<{ correct: boolean; correctPosition?: { x: number; y: number } }> {
    try {
      const session = await Session.findById(sessionId);
      if (!session || !session.kinestheticData) {
        throw new Error('Session or kinesthetic data not found');
      }

      const dropZone = session.kinestheticData.dropZones.find(
        (zone: any) => zone.elementId === elementId
      );

      if (!dropZone) {
        return { correct: false };
      }

      // Calculate distance between dropped position and correct position
      const distance = Math.sqrt(
        Math.pow(droppedCoordinates.x - dropZone.x, 2) + 
        Math.pow(droppedCoordinates.y - dropZone.y, 2)
      );

      const isCorrect = distance <= dropZone.tolerance;

      return {
        correct: isCorrect,
        correctPosition: { x: dropZone.x, y: dropZone.y }
      };
    } catch (error) {
      console.error('Error validating kinesthetic answer:', error);
      throw new Error('Failed to validate kinesthetic answer');
    }
  }
}