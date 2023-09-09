import { Component, OnInit } from '@angular/core';
import { fabric } from 'fabric';
import { UtilityService } from '@oscc/utility.service';

@Component({
  selector: 'app-playground2',
  templateUrl: './playground2.component.html',
  styleUrls: ['./playground2.component.scss'],
})
export class Playground2Component implements OnInit {
  constructor(protected utility: UtilityService) {}

  output: string[] = [];

  canvas: fabric.Canvas;

  pausePanning = false;
  zoomStartScale = 0;
  currentX;
  currentY;
  xChange;
  yChange;
  lastX;
  lastY;

  ngOnInit() {
    this.canvas = new fabric.Canvas('c', {
      backgroundColor: '#ccc',
      selection: false,
    });
    this.canvas.setHeight(1400);
    this.canvas.setWidth(1400);
    fabric.Image.fromURL('https://i.pinimg.com/originals/ed/55/22/ed55223749f1d995b2bb0cbb24692c1d.jpg', (img) => {
      img.scale(0.5).set({
        left: 150,
        top: 100,
      });
      this.canvas.add(img).setActiveObject(img);
    });
    fabric.Image.fromURL('https://i.pinimg.com/originals/ed/55/22/ed55223749f1d995b2bb0cbb24692c1d.jpg', (img) => {
      img.scale(0.5).set({
        left: 150,
        top: 100,
      });
      this.canvas.add(img).setActiveObject(img);
    });

    this.canvas.on('touch:gesture', (e) => {
      //this.output.push(`touch:gesture (${e.e.touches.length})`);
      if (e.e.touches && e.e.touches.length == 2) {
        this.pausePanning = true;
        var point = new fabric.Point(e.self.x, e.self.y);
        if (e.self.state == 'start') {
          this.zoomStartScale = this.canvas.getZoom();
        }
        var delta = this.zoomStartScale * e.self.scale;
        this.canvas.zoomToPoint(point, delta);
        this.output.push(`zoom`);
        this.pausePanning = false;
      }
    });

    this.canvas.on('selection:created', (e) => {
      this.output.push(`selection:created`);
      this.pausePanning = true;
    });

    this.canvas.on('selection:cleared', (e) => {
      this.output.push(`selection:cleared`);
      this.pausePanning = false;
    });

    this.canvas.on('touch:drag', (e) => {
      //this.output.push(`touch:drag`);
      if (this.pausePanning == false && undefined != e.self.x && undefined != e.self.y) {
        this.currentX = e.self.x;
        this.currentY = e.self.y;
        this.xChange = this.currentX - this.lastX;
        this.yChange = this.currentY - this.lastY;

        if (Math.abs(this.currentX - this.lastX) <= 50 && Math.abs(this.currentY - this.lastY) <= 50) {
          var delta = new fabric.Point(this.xChange, this.yChange);
          this.canvas.relativePan(delta);
          this.output.push(`pan`);
        }

        this.lastX = e.self.x;
        this.lastY = e.self.y;
      }
    });

    this.canvas.on('mouse:wheel', (opt) => {
      this.output.push(`ss`);
      const delta = opt.e.deltaY;
      let zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
      this.canvas.requestRenderAll();
    });

    //ngOnInit(): void {
    //const canvas = new fabric.Canvas('myCanvas');
    //const text = new fabric.Textbox('Hello World', {
    //width: 200,
    //height: 100,
    //fontSize: 24,
    //cursorColor: 'blue',
    //left: 50,
    //top: 50
    //});

    //canvas.add(text);

    //}
  }
}
