import { Component, ElementRef, OnInit, OnDestroy, ViewChild, AfterViewInit, inject } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Movimentos } from '../../domain/movement/movimentos';
import { Solver } from '../../domain/solve/solver';

@Component({
  selector: 'app-cube',
  standalone: true,
  styleUrl: './cube.scss',
  templateUrl: './cube.html',
})
export class CubeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef;

  // Servicos
  private move = inject(Movimentos);
  private solver = inject(Solver);

  // Propriedades do THREE
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private animationFrameId: number = null!;
  
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

    this.criarCubos();
  }

  private onKeyDown(event: KeyboardEvent): void {
    const movimentos = "uUdDfFbBrRlL";
    if(movimentos.includes(event.key)){
      this.executarMovimento(event.key);
    }
    else if(event.key === 'Enter'){
      this.solver.startSolve();
    }
  }

  private executarMovimento(movimento: string): void{
    this.move.rotateLayer(movimento, this.scene);
    this.solver.keepMove(movimento);
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

    const offset = 0.9; // Espaçamento entre os cubos

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                
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
            }
        }
    }
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    this.move.renderRotation(this.scene);
    this.solver.solve(this.scene);

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}