//
//     Angular components KeyLines v8.1.0-8493609682
//
//     Copyright © 2011-2025 Cambridge Intelligence Limited.
//     All rights reserved.
//

import {
  Component, ElementRef, Input, Output, EventEmitter, Injectable, AfterViewInit, OnDestroy,
  OnChanges, SimpleChange, ContentChildren, ViewChild, NgZone
} from '@angular/core';

import type * as kl from 'keylines/esm';
import KeyLines from 'keylines/esm';
import { NgClass, NgStyle } from '@angular/common';

@Injectable()
export class KlComponentsService {
  constructor(private ngZone: NgZone) {}
  create(
    componentDefinitions: kl.Component[],
    pathToImages: string
  ): Promise<(kl.Chart | kl.TimeBar)[]> {
    // KeyLines paths configuration
    KeyLines.paths({ images: pathToImages });
    // KeyLines create components, running the KeyLines create call outside Angular
    // to prevent call of requestAnimationFrame from KeyLines triggering Angular change detection.
    return this.ngZone.runOutsideAngular(() => {
      return KeyLines.create(componentDefinitions);
    });
  }
}

@Component({
    selector: 'kl-component',
    template: '<div #container [ngClass]="containerClass" [ngStyle]="style"></div>',
    standalone: true,
    imports: [NgClass, NgStyle]
})
export class KlComponent implements OnChanges, OnDestroy {
  @Input() id: string = ""; //optional

  @Input('ngStyle') style: any; //optional

  @Input('klType') type: "chart" | "timebar" = "chart"; // optional
  @Input('klOptions') options: kl.ChartOptions | kl.TimeBarOptions = {}; // optional

  @Input('klContainerClass') containerClass: string = ""; // optional

  @Output('klReady') klReady = new EventEmitter(); // optional
  @Output('klEvents') klEvents = new EventEmitter(); // optional

  // Save the reference of the container element: see #container in the template
  @ViewChild('container', { static: false })
  private containerElement?: ElementRef;
  // The KeyLines component
  private component?: kl.Chart | kl.TimeBar;

  isChart(component: kl.Chart | kl.TimeBar): component is kl.Chart {
    return this.type === "chart";
  }

  // lifecycle hooks
  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    const { options } = changes;
    // Refresh the options when necessary
    if (options && !options.isFirstChange()) {
      this.refreshOptions(options.currentValue);
    }
  }
  ngOnDestroy() {
    if (this.component) {
      // ensure the component cleans up its resources
      this.component.destroy();
    }
  }

  // Kl instructions
  getHeader(): kl.Component {
    return { 
      container: this.containerElement ? this.containerElement.nativeElement : undefined,
      type: this.type,
      options: this.options 
    };
  }

  setUpComponent(component: kl.Chart | kl.TimeBar) {
    // save the reference of the component
    this.component = component;
    // trigger a klReady event with the component reference
    this.klReady.emit(component);
    // attach the component events
    this.registerEvent();
  }

  registerEvent() {
    function emitEvent(this: KlComponent, props: any): void {
      const klEvent = { name: props.name, args: props.event, preventDefault: false };
      // dispatch the event to the parent
      this.klEvents.emit(klEvent);
      if (klEvent.preventDefault && props.event && props.event.preventDefault) {
        props.event.preventDefault();
      }
    }
    if (this.component) {
      if (this.isChart(this.component)) {
        this.component.on('all', emitEvent.bind(this));
      } else {
        this.component.on('all', emitEvent.bind(this));
      }
    }
  }

  refreshOptions(options: kl.ChartOptions | kl.TimeBarOptions) {
    if (this.component) {
      // Use type guard to allow TypeScript to infer type and prevent errors
      if (this.isChart(this.component)) {
        this.component.options(options);
      }
      else {
        this.component.options(options);
      }
    }
  }
}

@Component({
    selector: 'kl-components',
    template: '<ng-content></ng-content>',
    standalone: true
})
export class KlComponents implements AfterViewInit {
  @Input('klImagesPath') pathToImages = ''; // optional
  @Output('klReady') klReady = new EventEmitter(); // optional

  // save the KeyLines service
  private KlComponentsService: KlComponentsService;
  // get the list of the children components
  // http://blog.thoughtram.io/angular/2015/09/03/forward-references-in-angular-2.html
  @ContentChildren(KlComponent)
  private components?: KlComponent[];

  // constructor
  constructor(KlComponentsService: KlComponentsService) {
    this.KlComponentsService = KlComponentsService;
  }

  // lifecycle hooks
  ngAfterViewInit() {
    if (!this.components) throw 'Could not find kl-component declaration';
    // iterate over the list of children components to create the KeyLines definition of components
    const componentDefinitions = this.components.map((component) => component.getHeader());
    this.createComponents(componentDefinitions);
  }

  // KL instructions
  createComponents(componentDefinitions: kl.Component[]) {
    // use the KeyLines service to create the components
    this.KlComponentsService.create(componentDefinitions, this.pathToImages)
      .then((components) => this.notifyComponents(components))
      .catch((error: any) => error);
  }

  notifyComponents(components: (kl.Chart | kl.TimeBar)[] | kl.Chart | kl.TimeBar) {
    // ensure that we have an array of components
    if (!Array.isArray(components)) {
      components = [components];
    }
    this.klReady.emit(components);
    // finalise the set up of registered components
    if (this.components){
      this.components.forEach((component, index) => { 
        component.setUpComponent((components as (kl.Chart | kl.TimeBar)[])[index])
      });
    }
  }
}
