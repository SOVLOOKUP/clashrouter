import { Cron } from 'croner'
import { updateAllAirports } from '../services/updateService'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return '未知错误'
}

function getErrorDetails(error: unknown): string {
  if (error instanceof Error) {
    return JSON.stringify({
      name: error.name,
      message: error.message,
      stack: error.stack
    })
  }

  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

// 定时任务管理
export class SchedulerService {
  private updateTask: Cron | null = null

  // 启动所有定时任务
  start() {
    this.startUpdateTask()
    console.log('✅ Scheduler service started')
  }

  // 停止所有定时任务
  stop() {
    this.updateTask?.stop()
    console.log('⏹️  Scheduler service stopped')
  }

  // 启动机场更新任务（每 1 分钟检查一次，由 updateFrequency 决定是否实际更新）
  private startUpdateTask() {
    this.updateTask = new Cron('* * * * *', async () => {
      console.log('⏰ Running scheduled airport update task...')
      try {
        const results = await updateAllAirports()
        const successCount = results.filter(r => r.success).length
        const failedCount = results.length - successCount
        console.log(`✅ Update task completed: ${successCount} success, ${failedCount} failed`)
      } catch (error: unknown) {
        console.error('❌ Update task failed:', getErrorMessage(error))
        console.error('❌ Update task details:', getErrorDetails(error))
      }
    })

    console.log('✅ Airport update task scheduled (check every 1 minute)')
  }

  // 手动触发机场更新
  async triggerUpdate() {
    console.log('🔄 Manually triggering airport update...')
    return await updateAllAirports()
  }
}

// 导出单例
export const scheduler = new SchedulerService()
