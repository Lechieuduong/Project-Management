import { Controller, Get, Header, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ExcelService } from './excel.service';

@ApiTags('Excel')
@Controller('excels')
export class ExcelController {
    constructor(private excelService: ExcelService) { }

    @Get('/download')
    @Header('Content-Type', 'text/xlsx')
    async downloadReport(
        @Res() res: Response
    ) {
        let result = await this.excelService.downloadExcel()
        res.download(`${result}`)
    }
}
