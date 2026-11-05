import { Injectable } from '@angular/core'
import * as THREE from 'three';

interface Movimento {
  axis: THREE.Vector3;
  layer: number;
  direction: number;
}

@Injectable({
	providedIn: 'root'
})
export class Movimentos {
	private X = new THREE.Vector3(1,0,0);
  private Y = new THREE.Vector3(0,1,0);
  private Z = new THREE.Vector3(0,0,1);

  private rotationGroup!: THREE.Group;
  private selectedCubes: THREE.Mesh[] = [];

  private rotating = false;
  private rotationAngle = 0;
  private rotationSpeed = 0.5;

  private rotationAxis = new THREE.Vector3();
  private rotationDirection = 1;


  // Movimentos
  private readonly dicionarioMovimentos: Map<string, Movimento> = new Map<string, Movimento>([
    ['u', {axis: this.Y, layer:  1, direction:  1}],
    ['U', {axis: this.Y, layer:  1, direction: -1}],
    ['d', {axis: this.Y, layer: -1, direction: -1}],
    ['D', {axis: this.Y, layer: -1, direction:  1}],

    ['f', {axis: this.Z, layer:  1, direction: -1}],
    ['F', {axis: this.Z, layer:  1, direction:  1}],
    ['b', {axis: this.Z, layer: -1, direction: -1}],
    ['B', {axis: this.Z, layer: -1, direction:  1}],

    ['r', {axis: this.X, layer:  1, direction:  1}],
    ['R', {axis: this.X, layer:  1, direction: -1}],
    ['l', {axis: this.X, layer: -1, direction:  1}],
    ['L', {axis: this.X, layer: -1, direction: -1}]
  ]);

  rotateLayer(
    movimento: string,
    cena: THREE.Scene
  ): void {
    if (this.rotating) return;

    const axis = this.dicionarioMovimentos.get(movimento)!.axis;
    const layer = this.dicionarioMovimentos.get(movimento)!.layer;
    const direction = this.dicionarioMovimentos.get(movimento)!.direction;

    this.rotationGroup = new THREE.Group();
    this.selectedCubes = [];

    this.rotationAxis.copy(axis).normalize();
    this.rotationDirection = direction;

    const cubes: THREE.Mesh[][][] = this.getCubesScene(cena);

    for (const row of cubes) {
      for (const column of row) {
        for (const cube of column) {
          if (Math.round(cube.position.dot(axis)) === layer) {
            this.rotationGroup.attach(cube);
            this.selectedCubes.push(cube);
          }
        }
      }
    }

    cena.add(this.rotationGroup);

    this.rotationAngle = 0;
    this.rotating = true;
  }

  finishRotation(
  	cena: THREE.Scene
  ): void {
    for (const cube of this.selectedCubes) {
      cena.attach(cube);
    }

    cena.remove(this.rotationGroup);

    this.selectedCubes = [];
    this.rotating = false;
    this.rotationAngle = 0;
  }

  renderRotation(
    cena: THREE.Scene,
    speed: number = 0.1
  ): void {
    this.rotationSpeed = speed;
  	if (this.rotating) {
      const angle = Math.min(
        this.rotationSpeed,
        Math.PI / 2 - this.rotationAngle
      );

      this.rotationGroup.rotateOnWorldAxis(
        this.rotationAxis,
        angle * this.rotationDirection
      );

      this.rotationAngle += angle;

      if (this.rotationAngle >= Math.PI / 2) {
        this.finishRotation(cena);
      }
    }
  }

  private getCubesScene(
    cena: THREE.Scene
  ): THREE.Mesh[][][]{

    const cubes: THREE.Mesh[][][] = Array.from(
      { length: 3},
      () => Array.from({ length: 3}, () => Array<THREE.Mesh>(3))
    );

    cena.traverse((object)=>{
      if(object instanceof THREE.Mesh){
        const x = Math.round(object.position.x);
        const y = Math.round(object.position.y);
        const z = Math.round(object.position.z);

        cubes[x+1][y+1][z+1] = object;
      }
    });

    return cubes;
  }
}
