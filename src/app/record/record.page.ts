import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonCard,
  IonCardTitle,
  IonCardSubtitle,
  IonCardHeader,
  IonCardContent,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import View from 'ol/View';
import { Feature, Map } from 'ol';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import { Geometry } from 'ol/geom';
import { Style, Stroke } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { RecordService } from './record.service';
import { SensorsService } from '../sensors/sensors.service';
import { Observable, Subject, takeUntil, timer } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-record-page',
  templateUrl: 'record.page.html',
  styleUrls: ['record.page.scss'],
  standalone: true,
  imports: [
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCard,
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    ExploreContainerComponent,
    AsyncPipe,
  ],
})
export class RecordPage {
  constructor(
    private recordService: RecordService,
    private sensorsService: SensorsService
  ) {}

  public activityRunning: boolean = false;
  public timer$: Observable<number> | undefined;
  private stopTimer$ = new Subject<boolean>();
  public timeElapsed: number = 0;

  startActivity() {
    this.timer$ = timer(0, 1000).pipe(takeUntil(this.stopTimer$));
    this.sensorsService.startMotionSensor();
    this.activityRunning = true;
  }

  pauseActivity() {
    this.sensorsService.stopMotionSensor();
    this.activityRunning = false;
    this.stopTimer$.next(true);
  }

  endActivity() {
    this.pauseActivity();
    this.recordService.saveActivity();
  }

  fakeRunData = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          coordinates: [
            [-114.11417790581667, 51.04647254789293],
            [-114.11252069194907, 51.04652464154],
            [-114.11111206016174, 51.04679813222526],
            [-114.1104906049617, 51.046954411891505],
            [-114.11022130770817, 51.04739720141649],
            [-114.10868838488071, 51.047905101835994],
            [-114.10744547448002, 51.04794417086836],
            [-114.10582969774232, 51.047866026937044],
            [-114.10369603488806, 51.04769672727309],
            [-114.10323328689141, 51.04764096386552],
          ],
          type: 'LineString',
        },
      },
    ],
  };

  map: Map | undefined;

  vectorSource: VectorSource = new VectorSource({
    features: new GeoJSON()
      .readFeatures(this.fakeRunData, {
        featureProjection: 'EPSG:3857',
      })
      .map((feature) => feature as Feature<Geometry>),
  });

  // Define the style for line features
  lineStyle = new Style({
    stroke: new Stroke({
      color: '#ffcc33',
      width: 4,
    }),
  });

  vectorLayer = new VectorLayer({
    source: this.vectorSource,
    style: this.lineStyle,
  });

  calgaryCoords = [-114.11388000463317, 51.046448538027505];
  calgaryMercator = fromLonLat(this.calgaryCoords);

  ionViewDidEnter() {
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        this.vectorLayer,
      ],
      view: new View({
        center: this.calgaryMercator,
        zoom: 14,
      }),
    });
  }
}
