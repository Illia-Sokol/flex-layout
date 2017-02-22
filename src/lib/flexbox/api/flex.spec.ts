/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BreakPointsProvider} from '../../media-query/breakpoints/break-points';
import {BreakPointRegistry} from '../../media-query/breakpoints/break-point-registry';
import {MockMatchMedia} from '../../media-query/mock/mock-match-media';
import {MatchMedia} from '../../media-query/match-media';
import {FlexLayoutModule} from '../_module';

import {customMatchers, expect } from '../../utils/testing/custom-matchers';
import { _dom as _ } from '../../utils/testing/dom-tools';

import {
  makeExpectDOMFrom,
  makeExpectDOMForQuery,
  makeCreateTestComponent,
  expectNativeEl,
  queryFor
} from '../../utils/testing/helpers';

const isIE = !!document["documentMode"];

describe('flex directive', () => {
  let fixture: ComponentFixture<any>;
  let expectDOMFrom = makeExpectDOMFrom(() => TestFlexComponent);
  let expectDomForQuery = makeExpectDOMForQuery(() => TestFlexComponent);
  let componentWithTemplate = makeCreateTestComponent(() => TestFlexComponent);
  let activateMediaQuery = (alias, allowOverlaps?: boolean) => {
    let matchMedia: MockMatchMedia = fixture.debugElement.injector.get(MatchMedia);
    matchMedia.activate(alias, allowOverlaps);
  };

  beforeEach(() => {
    jasmine.addMatchers(customMatchers);

    // Configure testbed to prepare services
    TestBed.configureTestingModule({
      imports: [CommonModule, FlexLayoutModule],
      declarations: [TestFlexComponent],
      providers: [
        BreakPointRegistry, BreakPointsProvider,
        {provide: MatchMedia, useClass: MockMatchMedia}
      ]
    });
  });
  afterEach(() => {
    if (fixture) {
      fixture.debugElement.injector.get(MatchMedia).clearAll();
      fixture = null;
    }
  });

  describe('with static features', () => {

    it('should add correct styles for default `fxFlex` usage', () => {
      let fRef = componentWithTemplate(`<div fxFlex></div>`);
      fRef.detectChanges();

      let dom = fRef.debugElement.children[0].nativeElement;
      let isBox = _.hasStyle(dom, 'box-sizing', 'border-box');
      let hasFlex = _.hasStyle(dom, 'flex', '1 1 1e-09px') ||         // IE
          _.hasStyle(dom, 'flex', '1 1 1e-9px') ||          // Chrome
          _.hasStyle(dom, 'flex', '1 1 0.000000001px') ||   // Safari
          _.hasStyle(dom, 'flex', '1 1 0px');

      expect(isBox).toBeTruthy();
      expect(hasFlex).toBeTruthy();
    });

    it('should add correct styles for `fxFlex="0%"` usage', () => {
      expectDOMFrom(`<div fxFlex="2%"></div>`).toHaveCssStyle({
        'max-width': '2%',
        'flex': '1 1 100%',
        'box-sizing': 'border-box',
      });
    });

    it('should work with percentage values', () => {
      expectDOMFrom(`<div fxFlex="37%"></div>`).toHaveCssStyle({
        'flex': '1 1 100%',
        'max-width': '37%',
        'box-sizing': 'border-box',
      });
    });
    it('should work with pixel values', () => {
      expectDOMFrom(`<div fxFlex="37px"></div>`).toHaveCssStyle({
        'flex': '1 1 37px',
        'box-sizing': 'border-box',
      });
    });
    it('should work with "1 0 auto" values', () => {
      expectDOMFrom(`<div fxFlex="1 0 auto"></div>`).toHaveCssStyle({
        'flex': '1 0 auto',
        'box-sizing': 'border-box',
      });
    });
    it('should work with "1 1 auto" values', () => {
      expectDOMFrom(`<div fxFlex="1 1 auto"></div>`).toHaveCssStyle({
        'flex': '1 1 auto',
        'box-sizing': 'border-box',
      });
    });
    it('should work with calc values', () => {
      // @see http://caniuse.com/#feat=calc for IE issues with calc()
      if (!isIE) {
        expectDOMFrom(`<div fxFlex="calc(30vw - 10px)"></div>`).toHaveCssStyle({
          'box-sizing': 'border-box',
          'flex': '1 1 calc(30vw - 10px)'
        });
      }
    });

    it('should work with "auto" values', () => {
      expectDOMFrom(`<div fxFlex="auto"></div>`).toHaveCssStyle({
        'flex': '1 1 auto'
      });
    });
    it('should work with "nogrow" values', () => {
      expectDOMFrom(`<div fxFlex="nogrow"></div>`).toHaveCssStyle({
        'flex': '0 1 auto'
      });
    });
    it('should work with "grow" values', () => {
      expectDOMFrom(`<div fxFlex="grow"></div>`).toHaveCssStyle({
        'flex': '1 1 100%'
      });
    });
    it('should work with "initial" values', () => {
      expectDOMFrom(`<div fxFlex="initial"></div>`).toHaveCssStyle({
        'flex': '0 1 auto'
      });
    });
    it('should work with "noshrink" values', () => {
      expectDOMFrom(`<div fxFlex="noshrink"></div>`).toHaveCssStyle({
        'flex': '1 0 auto'
      });
    });
    it('should work with "none" values', () => {
      expectDOMFrom(`<div fxFlex="none"></div>`).toHaveCssStyle({
        'flex': '0 0 auto'
      });
    });

    it('should work with full-spec values', () => {
      expectDOMFrom(`<div fxFlex="1 2 0.9em"></div>`).toHaveCssStyle({
        'flex': '1 2 0.9em'
      });
    });
    it('should set a min-width when the shrink == 0', () => {
      expectDOMFrom(`<div fxFlex="1 0 37px"></div>`).toHaveCssStyle({
        'flex': '1 0 37px',
        'min-width': '37px',
        'box-sizing': 'border-box',
      });
    });
    it('should set a min-width and max-width when the grow == 0 and shrink == 0', () => {
      expectDOMFrom(`<div fxFlex="0 0 375px"></div>`).toHaveCssStyle({
        'flex': '0 0 375px',
        'max-width': '375px',
        'min-width': '375px',
        'box-sizing': 'border-box',
      });
    });


    it('should not set max-width to 69px when fxFlex="1 0 69px"', () => {
      expectDOMFrom(`<div fxFlex="1 0 69px"></div>`).not.toHaveCssStyle({
        'max-width': '69px',
      });
    });

    it('should not set a max-width when the shrink == 0', () => {
      let fRef = componentWithTemplate(`<div fxFlex="1 0 303px"></div>`);
      fRef.detectChanges();

      let dom = fRef.debugElement.children[0].nativeElement;
      let maxWidthStyle = _.getStyle(dom, 'max-width');

      expect(maxWidthStyle).toBeFalsy();
    });

    it('should not set min-width to 96px when fxFlex="0 1 96px"', () => {
      expectDOMFrom(`<div fxFlex="0 1 96px"></div>`).not.toHaveCssStyle({
        'min-width': '96px',
      });
    });

    it('should not set a min-width when the grow == 0', () => {
      let fRef = componentWithTemplate(`<div fxFlex="0 1 313px"></div>`);
      fRef.detectChanges();

      let dom = fRef.debugElement.children[0].nativeElement;
      let minWidthStyle = _.getStyle(dom, 'min-width');

      expect(minWidthStyle).toBeFalsy();
    });

    it('should set a min-width when basis is a Px value', () => {
      expectDOMFrom(`<div fxFlex="312px"></div>`).toHaveCssStyle({
        'flex': '1 1 312px',
        'max-width': '312px',
        'min-width': '312px'
      });
    });

    describe('', () => {

      it('should ignore fxLayout settings on same element', () => {
        expectDOMFrom(`
          <div fxLayout="column" fxFlex="37%">
          </div>
        `)
            .not.toHaveCssStyle({
          'flex-direction': 'row',
          'max-height': '37%',
        });
      });

      it('should set max-height for `fxFlex="<%val>"` with parent using fxLayout="column" ', () => {
        let template = `
          <div fxLayout="column">
            <div fxFlex="37%"></div>
          </div>
        `;

        expectDomForQuery(template, "[fxFlex]")
            .toHaveCssStyle({
              'max-height': '37%',
            });
      });

      it('should set max-width for `fxFlex="<%val>"`', () => {
        expectDOMFrom(`<div fxFlex="37%"></div>`).toHaveCssStyle({
          'max-width': '37%',
        });
      });

      it('should set max-width for `fxFlex="2%"` usage', () => {
        expectDOMFrom(`<div fxFlex="2%"></div>`).toHaveCssStyle({
          'max-width': '2%',
        });
      });

    });
  });

  describe('with responsive features', () => {

    it('should initialize the component with the largest matching breakpoint', () => {
      fixture = componentWithTemplate(`
          <div  fxFlex="auto" 
                fxFlex.gt-xs="33%" 
                fxFlex.gt-sm="50%" >
          </div>
        `);

      activateMediaQuery('xl');
      expectNativeEl(fixture).toHaveCssStyle({
        'flex': '1 1 50%'
      });

      activateMediaQuery('sm');
      expectNativeEl(fixture).toHaveCssStyle({
        'flex': '1 1 33%'
      });
    });

    it('should fallback the default layout properly', () => {
      fixture = componentWithTemplate(`
          <div fxLayout="column">
            <div fxFlex="auto" fxFlex.gt-sm="50"  >  </div>
            <div fxFlex="auto" fxFlex.gt-sm="24.4">  </div>
            <div fxFlex="auto" fxFlex.gt-sm="25.6">  </div>
          </div>
        `);

      activateMediaQuery('sm', true);
      fixture.detectChanges();

      let nodes = queryFor(fixture, "[fxFlex]");
      expect(nodes.length).toEqual(3);
      expect(nodes[0].nativeElement).toHaveCssStyle({'flex': '1 1 auto'});
      expect(nodes[1].nativeElement).toHaveCssStyle({'flex': '1 1 auto'});
      expect(nodes[2].nativeElement).toHaveCssStyle({'flex': '1 1 auto'});

      activateMediaQuery('xl', true);
      fixture.detectChanges();

      nodes = queryFor(fixture, "[fxFlex]");
      expect(nodes[0].nativeElement).toHaveCssStyle({'flex': '1 1 100%', 'max-height': '50%'});
      expect(nodes[1].nativeElement).toHaveCssStyle({'flex': '1 1 100%', 'max-height': '24.4%'});
      expect(nodes[2].nativeElement).toHaveCssStyle({'flex': '1 1 100%', 'max-height': '25.6%'});

      activateMediaQuery('sm', true);
      fixture.detectChanges();

      nodes = queryFor(fixture, "[fxFlex]");
      expect(nodes.length).toEqual(3);
      expect(nodes[0].nativeElement).toHaveCssStyle({'flex': '1 1 auto'});
      expect(nodes[1].nativeElement).toHaveCssStyle({'flex': '1 1 auto'});
      expect(nodes[2].nativeElement).toHaveCssStyle({'flex': '1 1 auto'});

      expect(nodes[0].nativeElement).not.toHaveCssStyle({'max-height': '50%'});
      expect(nodes[1].nativeElement).not.toHaveCssStyle({'max-height': '24.4%'});
      expect(nodes[2].nativeElement).not.toHaveCssStyle({'max-height': '25.6%'});
      expect(nodes[0].nativeElement).not.toHaveCssStyle({'max-height': '*'});
      expect(nodes[1].nativeElement).not.toHaveCssStyle({'max-height': '*'});
      expect(nodes[2].nativeElement).not.toHaveCssStyle({'max-height': '*'});
    });
  });
});


// *****************************************************************
// Template Component
// *****************************************************************

@Component({
  selector: 'test-layout',
  template: `<span>PlaceHolder Template HTML</span>`
})
export class TestFlexComponent implements OnInit {
  public direction = "column";

  constructor() {
  }

  ngOnInit() {
  }
}

