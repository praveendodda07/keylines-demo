import { Component } from '@angular/core';
import { Proto1Component } from './proto-1/proto-1.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    standalone: true,
    imports: [Proto1Component],
})
export class AppComponent {}
