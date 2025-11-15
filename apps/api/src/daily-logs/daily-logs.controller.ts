import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { DailyLogsService } from './daily-logs.service';
import { CreateDailyLogDto } from './dto/create-daily-log.dto';
import { UpdateDailyLogDto } from './dto/update-daily-log.dto';

@Controller('daily-logs')
export class DailyLogsController {
  constructor(private readonly dailyLogsService: DailyLogsService) {}

  @Post()
  create(@Body() createDailyLogDto: CreateDailyLogDto) {
    return this.dailyLogsService.create(createDailyLogDto);
  }

  @Get('challenge/:challengeId')
  findByChallenge(@Param('challengeId') challengeId: string) {
    return this.dailyLogsService.findByChallenge(challengeId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDailyLogDto: UpdateDailyLogDto) {
    return this.dailyLogsService.update(id, updateDailyLogDto);
  }

  @Get('rewards/:userId')
  findRewards(@Param('userId') userId: string) {
    return this.dailyLogsService.findRewardsByUser(userId);
  }
}
