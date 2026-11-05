import { Component, signal } from '@angular/core';
import { CubeComponent } from './cube/cube';

@Component({
  imports: [CubeComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
}
