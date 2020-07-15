import { Component } from '@angular/core';
import {icon, latLng, marker, polyline, tileLayer, Map, Path, Layer, Polyline, LatLng, LeafletEvent} from 'leaflet';
import * as d3 from 'd3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'demoTrafficViz';

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

  handleMapMoveEnd(e: LeafletEvent) {
    this.repaint((e.sourceTarget as Map));
  }
  handleMapZoomEnd(e: LeafletEvent) {
    this.repaint((e.sourceTarget as Map));
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
      [48.146144, 11.573248, 48.148198, 11.574578]
    ];
    const zoomlevel = 10 - Math.abs(this.transformRange(map.getZoom(), {max: 10, min: 20}, {max: 1, min: 10})) * 1.2;

    const bla = d3.scaleLinear().domain([1, 100]).range(['#1aed36', '#f51e0f']);
    routes.forEach( e => {
      const polyLine = new Polyline([new LatLng(e[0], e[1]), new LatLng(e[2], e[3])], {
        color: bla(Math.random() * 100),
        opacity: 1,
        weight: zoomlevel
      });
      polyLine.on('click', (f: any) => {console.log(f); });
      polyLine.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
      map.addLayer(polyLine);
      this.layer.push(polyLine);

      // polyLine.addTo(map);
    });


  }

  onMapReady(map: Map) {
    this.repaint(map);
  }
}
