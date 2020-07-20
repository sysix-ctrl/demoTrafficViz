import { Component } from '@angular/core';
import {icon, latLng, marker, polyline, tileLayer, Map, Path, Layer, Polyline, LatLng, LeafletEvent, Polygon} from 'leaflet';
import * as d3 from 'd3';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'demoTrafficViz';
  map = null;
  layer: Polyline[] = [];

  // Define our base layers so we can reference them multiple times
  streetMaps = tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    detectRetina: true,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  wMaps = tileLayer('http://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
    detectRetina: true,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // Marker for the top of Mt. Ranier
  summit = marker([ 48.1455875, 11.5687117 ], {
    icon: icon({
      iconSize: [ 25, 41 ],
      iconAnchor: [ 13, 41 ],
      iconUrl: 'leaflet/marker-icon.png',
      shadowUrl: 'leaflet/marker-shadow.png'
    })
  });

  // Marker for the parking lot at the base of Mt. Ranier trails
  paradise = marker([ 46.78465227596462,-121.74141269177198 ], {
    icon: icon({
      iconSize: [ 25, 41 ],
      iconAnchor: [ 13, 41 ],
      iconUrl: 'leaflet/marker-icon.png',
      iconRetinaUrl: 'leaflet/marker-icon-2x.png',
      shadowUrl: 'leaflet/marker-shadow.png'
    })
  });

  // Path from paradise to summit - most points omitted from this example for brevity
  route = polyline([[ 46.78465227596462, -121.74141269177198 ],
    [ 46.80047278292477, -121.73470708541572 ],
    [ 46.815471360459924, -121.72521826811135 ],
    [ 46.8360239546746, -121.7323131300509 ],
    [ 46.844306448474526, -121.73327445052564 ],
    [ 46.84979408048093, -121.74325201660395 ],
    [ 46.853193528950214, -121.74823296256363 ],
    [ 46.85322881676257, -121.74843915738165 ],
    [ 46.85119913890958, -121.7519719619304 ],
    [ 46.85103829018772, -121.7542376741767 ],
    [ 46.85101557523012, -121.75431755371392 ],
    [ 46.85140013694763, -121.75727385096252 ],
    [ 46.8525277543813, -121.75995212048292 ],
    [ 46.85290292836726, -121.76049157977104 ],
    [ 46.8528160918504, -121.76042997278273 ]]);

  // Layers control object with our two base layers and the three overlay layers
  layersControl = {
    baseLayers: {
      'Street Maps': this.streetMaps,
      'Wikimedia Maps': this.wMaps
    },
    overlays: {
      'Mt. Rainier Summit': this.summit,
      'Mt. Rainier Paradise Start': this.paradise,
      'Mt. Rainier Climb Route': this.route
    }
  };

  // Set the initial set of displayed layers (we could also use the leafletLayers input binding for this)
  options = {
    layers: [ this.streetMaps, this.route, this.summit, this.paradise ],
    zoom: 16,
    center: latLng([ 48.1455875, 11.5687117 ])
  };

  methode = '';

  drawheatmap() {
    const map = this.map;
    const xSize = 20;
    const ySize = 30;
    const boxSizeX = 0.003;
    const boxSizeY = 0.009;
    const xx = 0.0015;
    const yy = 0.003;

    const startLat = 48.133447;
    const startLon = 11.533672;
    let lat = startLat;
    let lon = startLon;

    const bla = d3.scaleLinear().domain([1, 100]).range(['#1aed36', '#f51e0f']);

    for (let y = 0; y < ySize; y++) {
      for (let x = 0; x < xSize; x++) {
        lon += boxSizeY;
        const startpos = new LatLng(lat, lon);
        const startpos2 = new LatLng(lat + boxSizeX, lon);
        const startpos4 = new LatLng(lat, lon - boxSizeY);
        const startpos3 = new LatLng(lat + boxSizeX, lon - boxSizeY);
        const array1 = [startpos, startpos2, startpos3, startpos4];

        const array = [
          new LatLng(lat + xx, lon - xx),
          new LatLng(lat + xx, lon + xx),
          new LatLng(lat, lon + yy),
          new LatLng(lat - xx, lon + xx),
          new LatLng(lat - xx, lon - xx),
          new LatLng(lat, lon - yy)
        ];

        const rndm = Math.random() * 100;
        const poly = new Polygon(array, {
          color: bla(rndm),
          weight: 0,
          opacity: 1,
          fillOpacity: .4
        });

        poly.bindPopup("Luftbelastung <b>" + rndm + " µg/m³</b>").openPopup();

        map.addLayer(poly);
      }
      lon = startLon;
      lat += boxSizeX * 0.5;
      if (y % 2 == 0)
        lon += boxSizeY * 0.5;
    }
  }

  constructor(private activatedRoute: ActivatedRoute) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.methode = params['methode'];

      if (this.methode === "heat") {
        this.drawheatmap();
      } else {
        if(this.map != null)
          this.repaint(this.map);
      }
    });
  }



  handleMapMoveEnd(e: LeafletEvent) {
    if (this.methode !== 'heat'){

      this.repaint((e.sourceTarget as Map));
    }
  }
  handleMapZoomEnd(e: LeafletEvent) {
    if (this.methode !== 'heat') {

      this.repaint((e.sourceTarget as Map));
    }
  }

  transformRange(value: number, r1: any, r2: any) {
    const scale = (r2.max - r2.min) / (r1.max - r1.min)
    return (value - r1.min) * scale;
  }

  repaint(map: Map) {
    this.layer.forEach(e => map.removeLayer(e));
    this.layer = [];

    const routes = [
        [48.143487, 11.573688, 48.145355, 11.574643],
        [48.144547, 11.569761, 48.143487, 11.573688],
        [48.144547, 11.569761, 48.145149, 11.569493],
        [48.145149, 11.569493, 48.146881, 11.570598],
        [48.146881, 11.570598, 48.146144, 11.573248],
        [48.146144, 11.573248, 48.148198, 11.574578],
        [48.145149, 11.569493, 48.144886, 11.568565],
        [48.144886, 11.568565, 48.14540983185189, 11.566574500926862],
        [48.14540983185189, 11.566574500926862, 48.14759057452225, 11.568006800540815],
        [48.14759057452225, 11.568006800540815, 48.14687925997293, 11.5705978144492],
        [48.14687925997293, 11.5705978144492, 48.148200945942314, 11.571461485751996],
        [48.148200945942314, 11.571461485751996, 48.148978574746735, 11.571938918956647],
        [48.148978574746735, 11.571938918956647, 48.14818853767597, 11.57461576355351],
        [48.14482137908321, 11.568645166286359, 48.14432479318699, 11.568940209277997],
        [48.14432479318699, 11.568940209277997, 48.14455125188449, 11.569707321056256],
        [48.14432479318699, 11.568940209277997, 48.14268013160753, 11.567899512180219],
        [48.14268013160753, 11.567899512180219, 48.14342204901308, 11.56535141361607],
        [48.14342204901308, 11.56535141361607, 48.14540243192876, 11.56660132301701],
        [48.14268013160753, 11.567899512180219, 48.14416848943745, 11.562679933437238],
        [48.14267678975468, 11.56785659683598, 48.142323366614725, 11.569256709941754],
        [48.142323366614725, 11.569256709941754, 48.14274313038679, 11.570570992359052],
        [48.14274313038679, 11.570570992359052, 48.14430116676012, 11.569460557826886],
        [48.14614550192693, 11.573145913013349, 48.145427008617894, 11.574685500987897],
        [48.145427008617894, 11.574685500987897, 48.14553176439489, 11.577308701404462],
        [48.14553176439489, 11.577308701404462, 48.14577969382124, 11.574835704692731],
        [48.14577969382124, 11.574835704692731, 48.146177953450305, 11.573274659046064],
        [48.146177953450305, 11.573274659046064, 48.145146384799276, 11.572668479808698],
        [48.145146384799276, 11.572668479808698, 48.14586679054953, 11.570066737064252],
        [48.145146384799276, 11.572668479808698, 48.14396708249312, 11.57186381710423],
        [48.143384580197015, 11.572545098194013, 48.1427519575768, 11.570544170268903],
        [48.1427519575768, 11.570544170268903, 48.14219807823002, 11.570903586276899],
        [48.14219807823002, 11.570903586276899, 48.141651352166264, 11.57135956180943],
        [48.141651352166264, 11.57135956180943, 48.142235782779004, 11.573167370685468],
        [48.142235782779004, 11.573167370685468, 48.143414408261584, 11.573752092250714],
        [48.14345473711963, 11.573564337619672, 48.1428149562679, 11.57288305652989],
        [48.1428149562679, 11.57288305652989, 48.14221251468234, 11.570938454994092],
        [48.14221251468234, 11.570938454994092, 48.14164204401452, 11.569256709941754],
        [48.14164204401452, 11.569256709941754, 48.14211681997819, 11.568417178520093],
        [48.14211681997819, 11.568417178520093, 48.14244482922053, 11.568725632556806],
        [48.14211681997819, 11.568417178520093, 48.14094723275521, 11.567124353774915],
        [48.141386218677916, 11.567556189426313, 48.142666404032354, 11.567886101135144],
        [48.145421277677414, 11.566563772090802, 48.14596760530589, 11.56473718775166],
        [48.146390918575705, 11.564168559440503, 48.148325970308754, 11.565431879886518],
        [48.148325970308754, 11.565431879886518, 48.147623136873136, 11.568079220184217]


    ];
    const zoomlevel = 10 - Math.abs(this.transformRange(map.getZoom(), {max: 10, min: 20}, {max: 1, min: 10})) * 1.2;

    const colorRange = d3.scaleLinear().domain([1, 100]).range(['#1aed36', '#f51e0f']);
    routes.forEach( e => {
      const polyLine = new Polyline([new LatLng(e[0], e[1]), new LatLng(e[2], e[3])], {
        color: colorRange(Math.random() * 100),
        opacity: 1,
        weight: zoomlevel
      });

      polyLine.on('click', (f: any) => {console.log(f); });
      polyLine.bindPopup("<b>Das Hier</b><br>könnte auch ein Diagramm sein").openPopup();
      map.addLayer(polyLine);
      this.layer.push(polyLine);
    });
  }


  onMapReady(map: Map) {
    this.map = map;
    if (this.methode == null) {

      //this.repaint(this.map);
    }
  }
}
