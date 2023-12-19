import { Body, Controller, Get, Post, Render, Res } from '@nestjs/common';
import * as mysql from 'mysql2';
import { AppService } from './app.service';
import { kuponDTO } from './kuponDto';
import { Response } from 'express';
import { title } from 'process';

const conn = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'szinhazdb',
}).promise();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  async index() {
    const [adatok] = await conn.execute('SELECT id, title, percentage, code FROM szinhaz ORDER BY title')
    console.log(adatok);
    
    return { coupons:adatok,title: 'Táblázat' };
  }
  @Get('/ujKupon')
  @Render('ujKupon')
  kupon(){
    return{title: 'Új kupon felvétele',error:''}
  }
  @Post('/ujKupon')
  @Render('ujKupon')
  async ujFelvetel(@Body() newCoupon: kuponDTO, @Res() res:Response){
    const cim = newCoupon.cim;
    const kedvezmeny = newCoupon.kedvezmeny;
    const kod = newCoupon.kod;
    const regex:RegExp = /^[A-Z]{4}-\d{6}$/;
    if (cim.trim() == "" || kedvezmeny.toString().trim() == "" || kod.trim() == "") {
      return {error: "Kötelező minden mezőt kitölteni!",title: 'Új kupon felvétele'};
    }
    else if (!regex.test(kod)) {
      return {error: "A kód formátuma nem megfelelő!",title: 'Új kupon felvétele'};
    }
    else if (kedvezmeny < 0 || kedvezmeny > 100)
    {
      return {error: "A kedvezmény minimum 1, maximum pedig 100% lehet",title: 'Új kupon felvétele'};
    }
    else{
      const [ adatok ] = await conn.execute('INSERT INTO szinhaz (title, percentage, code) VALUES (?, ?, ?)', [ 
        cim,
        kedvezmeny,
        kod,
      ],
      );
      res.redirect('/'); 
    }
    
  }
}
