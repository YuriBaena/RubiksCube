import { Component, ElementRef, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-cube',
  standalone: true,
  styleUrl: './cube.scss',
  templateUrl: './cube.html',
})
export class CubeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private cubes: THREE.Mesh[][][] = [];
  private controls!: OrbitControls;
  private animationFrameId: number = null!;

  private X = new THREE.Vector3(1,0,0);
  private Y = new THREE.Vector3(0,1,0);
  private Z = new THREE.Vector3(0,0,1);

  private rotationGroup!: THREE.Group;
  private selectedCubes: THREE.Mesh[] = [];

  private rotating = false;
  private rotationAngle = 0;
  private cam = 0;
  private rotationSpeed = 0.5;

  private rotationAxis = new THREE.Vector3();
  private rotationDirection = 1;
  
  // Referência bound para remover o listener corretamente depois
  private boundKeydownListener = this.onKeyDown.bind(this);

  ngAfterViewInit(): void {
    this.initThreeJs();
    this.animate();

    // Adiciona o listener de teclado na janela
    window.addEventListener('keydown', this.boundKeydownListener);
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.controls) {
      this.controls.dispose();
    }
    // Remove o listener de teclado para evitar vazamentos de memória
    window.removeEventListener('keydown', this.boundKeydownListener);
  }

  private initThreeJs(): void {
    const element = this.rendererContainer.nativeElement;
    const width = element.clientWidth;
    const height = element.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 10;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    element.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 3;

    this.criarCubos();
  }

  private onKeyDown(event: KeyboardEvent): void {
    switch(event.key){
      case 'u': 
        this.rotateLayer(this.Y, 1, 1);
        break;
      case 'U': 
        this.rotateLayer(this.Y, 1, -1);
        break;

      case 'd': 
        this.rotateLayer(this.Y, -1, -1);
        break;
      case 'D': 
        this.rotateLayer(this.Y, -1, 1);
        break;

      case 'f':
        this.rotateLayer(this.Z, 1, -1);
        break;
      case 'F':
        this.rotateLayer(this.Z, 1, 1);
        break;

      case 'b':
        this.rotateLayer(this.Z, -1, -1);
        break;
      case 'B':
        this.rotateLayer(this.Z, -1, 1);
        break;

      case 'r':
        this.rotateLayer(this.X, 1, 1);
        break;
      case 'R':
        this.rotateLayer(this.X, 1, -1);
        break;

      case 'l':
        this.rotateLayer(this.X, -1, 1);
        break;
      case 'L':
        this.rotateLayer(this.X, -1, -1);
        break;
    }
  }

  private rotateLayer(
    axis: THREE.Vector3,
    layer: number,
    direction: number
  ): void {
    if (this.rotating) return;

    this.rotationGroup = new THREE.Group();
    this.selectedCubes = [];

    this.rotationAxis.copy(axis).normalize();
    this.rotationDirection = direction;

    for (const row of this.cubes) {
      for (const column of row) {
        for (const cube of column) {
          if (Math.round(cube.position.dot(axis)) === layer) {
            this.rotationGroup.attach(cube);
            this.selectedCubes.push(cube);
          }
        }
      }
    }

    this.scene.add(this.rotationGroup);

    this.rotationAngle = 0;
    this.rotating = true;
  }

  private finishRotation(): void {
    for (const cube of this.selectedCubes) {
      this.scene.attach(cube);
    }

    this.scene.remove(this.rotationGroup);

    this.selectedCubes = [];
    this.rotating = false;
    this.rotationAngle = 0;
  }

  private criarCubos(): void {
    const geometry = new THREE.BoxGeometry(0.85, 0.85, 0.85);
    
    const C = {
        PRETO: 0x000000,    // Interior / Faces escondidas
        BRANCO: 0xFFFFFF,   // Topo (U)
        AMARELO: 0xFFFF00,  // Base (D)
        VERMELHO: 0xFF0000, // Frente (F)
        LARANJA: 0xFF7700,  // Trás (B)
        AZUL: 0x0000FF,     // Direita (R)
        VERDE: 0x00FF00     // Esquerda (L)
    };

    // Estrutura tridimensional para guardar os cubos [x][y][z]
    this.cubes = [];
    const offset = 0.9; // Espaçamento entre os cubos

    for (let x = -1; x <= 1; x++) {
        this.cubes[x + 1] = [];
        for (let y = -1; y <= 1; y++) {
            this.cubes[x + 1][y + 1] = [];
            for (let z = -1; z <= 1; z++) {
                
                // Opcional: Pula o centro interno (que não aparece)
                // Se quiser o cubo oco por dentro para economizar memória:
                // if (x === 0 && y === 0 && z === 0) continue;

                // Define a cor de cada uma das 6 faces dependendo da posição externa
                const faces: { [index: number]: number } = {
                    0: x ===  1 ? C.AZUL : C.PRETO,    // Direita (+X)
                    1: x === -1 ? C.VERDE : C.PRETO,   // Esquerda (-X)
                    2: y ===  1 ? C.BRANCO : C.PRETO,  // Topo (+Y)
                    3: y === -1 ? C.AMARELO : C.PRETO, // Base (-Y)
                    4: z ===  1 ? C.VERMELHO : C.PRETO,// Frente (+Z)
                    5: z === -1 ? C.LARANJA : C.PRETO  // Trás (-Z)
                };

                // Cria os materiais para as 6 faces
                const materials = Array.from({ length: 6 }, (_, i) => 
                    new THREE.MeshBasicMaterial({ color: faces[i] ?? C.PRETO })
                );

                const mesh = new THREE.Mesh(geometry, materials);
                mesh.position.set(x * offset, y * offset, z * offset);
                
                this.scene.add(mesh);
                this.cubes[x + 1][y + 1][z + 1] = mesh;
            }
        }
    }
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

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
        this.finishRotation();
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}