// src/movies/movies.controller.ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { SelectMovie } from '../db/schema';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  findAll(): Promise<SelectMovie[]> {
    return this.moviesService.findAll();
  }

  @Get(':imdbID')
  findByImdbID(@Param('imdbID') imdbID: string): Promise<SelectMovie | void> {
    return this.moviesService.findByImdbID(imdbID);
  }

  @Post()
  createFromOmdb(@Body('imdbID') imdbID: string): Promise<SelectMovie | void> {
    return this.moviesService.createFromOmdb(imdbID);
  }

  // Add other routes as needed (e.g., POST, PUT, DELETE)
}
