import { Injectable, inject } from '@angular/core';
import { Movimentos } from '../movement/movimentos';
import * as THREE from 'three';

@Injectable({
	providedIn: 'root'
})
export class Solver {
	private move = inject(Movimentos);

	private solving = false;
	private past_moves: string[] = [];

	keepMove(move: string){
		this.past_moves.push(move);
	}

	startSolve(): void{
		this.solving = true;
	}

	solve(
		cena: THREE.Scene
	): void {
		if(this.solving){
			const next_moves = this.getInversePastMoves();
			for(let i = next_moves.length-1; i>=0; i--){
				setTimeout(() => {
					this.move.rotateLayer(next_moves[i], cena);
					console.log(next_moves[i]);
				}, (next_moves.length - i)*1000);
			}
			this.past_moves = [];
			this.solving = false;
		}
	}

	private getInversePastMoves(): string[]{
		const moves = Array<string>(this.past_moves.length);
		this.past_moves.forEach((past, i)=>moves[i]=this.invert(past));
		return moves;
	}

	private invert(move: string): string{
		const ascii = move.charCodeAt(0);
		if(ascii > 97){
			return move.toUpperCase();
		}
		else{
			return move.toLowerCase();
		}
	}
}
