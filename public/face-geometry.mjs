// Style-only geometric heuristic; this is not a trained face-shape classifier.
export function estimateShape(points,width,height){
 if(!points||points.length<455||width<1||height<1)throw Error('No pudimos leer el contorno. Probá con otra selfie.');
 const p=i=>({x:points[i].x*width,y:points[i].y*height});
 const d=(a,b)=>Math.hypot(p(a).x-p(b).x,p(a).y-p(b).y);
 const cheek=d(234,454),length=d(10,152),jaw=d(172,397),forehead=d(54,284);
 if(cheek<width*.16||length<height*.2)throw Error('Acercá un poco la cara y volvé a intentarlo.');
 if([10,152,234,454].some(i=>points[i].x<.025||points[i].x>.975||points[i].y<.025||points[i].y>.975))throw Error('Necesitamos ver todo el contorno de tu cara, sin recortes.');
 const eyes=d(33,263),roll=Math.abs(p(33).y-p(263).y)/eyes;
 const left=d(1,234),right=d(1,454);
 if(roll>.16||Math.abs(left-right)/cheek>.13)throw Error('Mirá de frente, con la cabeza recta, y probá otra vez.');
 const ratios=[length/cheek,jaw/cheek,forehead/cheek];
 if(ratios.some(x=>!Number.isFinite(x))||ratios[0]<.9||ratios[0]>1.95)throw Error('No pudimos estimar la forma con esta perspectiva. Probá con otra foto de frente.');
 const templates={redondo:[1.20,.79,.91],ovalado:[1.46,.76,.91],cuadrado:[1.25,.89,.96],corazon:[1.34,.67,.99]};
 const scale=[.2,.13,.13];
 const ranked=Object.entries(templates).map(([key,t])=>({key,score:Math.sqrt(t.reduce((s,v,i)=>s+((ratios[i]-v)/scale[i])**2,0))})).sort((a,b)=>a.score-b.score);
 return {shape:ranked[0].key,alternative:ranked[1].score-ranked[0].score<.4?ranked[1].key:null};
}
