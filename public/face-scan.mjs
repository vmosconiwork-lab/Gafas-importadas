import {estimateShape} from './face-geometry.mjs';
const $=s=>document.querySelector(s),panel=$('#scan-panel'),video=$('#face-video'),canvas=$('#face-canvas'),status=$('#scan-status');
let stream=null,enginePromise=null,operation=0,busy=false,suggestion=null;
const names={redondo:'Redondo',ovalado:'Ovalado',cuadrado:'Cuadrado',corazon:'Corazón / triangular'};
function stopCamera(){if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;video.srcObject=null;$('#camera-area').hidden=true;$('#camera-capture').disabled=true;}
function clearPhoto(){canvas.width=1;canvas.height=1;$('#photo-file').value='';}
function setBusy(value){busy=value;for(const s of ['#camera-start','#photo-pick','#camera-capture'])$(s).disabled=value;panel.setAttribute('aria-busy',String(value));}
function cancel(){operation++;stopCamera();clearPhoto();setBusy(false);suggestion=null;$('#scan-answer').hidden=true;status.textContent='';}
function hide(){cancel();panel.hidden=true;}
async function engine(){if(!enginePromise){enginePromise=(async()=>{const {FaceLandmarker,FilesetResolver}=await import('./vendor/mediapipe/vision_bundle.mjs');const files=await FilesetResolver.forVisionTasks(new URL('./vendor/mediapipe/wasm',import.meta.url).href);return FaceLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:new URL('./vendor/mediapipe/face_landmarker.task',import.meta.url).href,delegate:'CPU'},runningMode:'IMAGE',numFaces:2,minFaceDetectionConfidence:.65,minFacePresenceConfidence:.65,outputFaceBlendshapes:false,outputFacialTransformationMatrixes:false});})().catch(e=>{enginePromise=null;throw e});}return enginePromise;}
function draw(source,w,h){const scale=Math.min(1,960/Math.max(w,h));canvas.width=Math.round(w*scale);canvas.height=Math.round(h*scale);canvas.getContext('2d').drawImage(source,0,0,canvas.width,canvas.height);}
async function analyze(ticket){
 setBusy(true);$('#scan-answer').hidden=true;status.textContent='Preparando el análisis en tu dispositivo. La primera vez puede tardar unos segundos…';
 try{let model;try{model=await engine()}catch{throw Error('El análisis no pudo cargarse en este navegador. Probá en Safari o Chrome, o elegí tu forma manualmente.')}if(ticket!==operation)return;
 status.textContent='Analizando el contorno…';await new Promise(r=>requestAnimationFrame(()=>setTimeout(r,30)));if(ticket!==operation)return;
 const result=model.detect(canvas);if(!result.faceLandmarks.length)throw Error('No encontramos un rostro claro. Probá con más luz y sin anteojos.');if(result.faceLandmarks.length!==1)throw Error('Usá una selfie en la que aparezca una sola persona.');
 const estimate=estimateShape(result.faceLandmarks[0],canvas.width,canvas.height);suggestion=estimate.shape;
 $('#scan-shape').textContent='Tu contorno podría ser '+names[suggestion].toLowerCase();$('#scan-description').textContent=estimate.alternative?'El resultado también se aproxima a '+names[estimate.alternative].toLowerCase()+'. Es una comparación aproximada de proporciones, no una medición exacta.':'Esta sugerencia compara las proporciones del contorno. Es una guía aproximada, no una clasificación exacta.';
 $('#scan-confirm').textContent='Ver modelos: '+names[suggestion];$('#scan-answer').hidden=false;status.textContent='Análisis terminado. Confirmá tu selección.';
 }catch(e){if(ticket===operation)status.textContent=e.message||'No pudimos analizar esta imagen. Elegí otra selfie o seleccioná tu forma manualmente.';}
 finally{if(ticket===operation){setBusy(false);clearPhoto();}}
}
$('#open-scan').onclick=()=>{panel.hidden=false;$('#scan-heading').setAttribute('tabindex','-1');$('#scan-heading').focus({preventScroll:true});panel.scrollIntoView({behavior:'smooth',block:'nearest'});};
$('#close-scan').onclick=()=>{hide();$('#open-scan').focus()};
$('#face-explorer').addEventListener('toggle',()=>{if(!$('#face-explorer').open)hide()});
$('#camera-start').onclick=async()=>{
 cancel();const ticket=operation;setBusy(true);status.textContent='Permití el acceso a la cámara para continuar.';
 try{if(!navigator.mediaDevices?.getUserMedia)throw Error('Este navegador no permite usar la cámara. Podés elegir una selfie.');const media=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:960},height:{ideal:960}},audio:false});if(ticket!==operation){media.getTracks().forEach(t=>t.stop());return;}stream=media;video.srcObject=media;$('#camera-area').hidden=false;await video.play();if(ticket!==operation)return;status.textContent='Ubicá tu cara de frente y tocá “Analizar esta imagen”.';setBusy(false);$('#camera-capture').disabled=!video.videoWidth;
 }catch(e){if(ticket===operation){stopCamera();setBusy(false);status.textContent=e.name==='NotAllowedError'?'No se habilitó la cámara. Podés permitirla en tu navegador o elegir una selfie.':e.name==='NotFoundError'?'No encontramos una cámara. Elegí una selfie.':e.message||'No se pudo abrir la cámara. Elegí una selfie.';}}
};
video.addEventListener('loadeddata',()=>{if(stream&&!busy)$('#camera-capture').disabled=false});
$('#camera-stop').onclick=()=>{cancel();status.textContent='Cámara apagada.'};
$('#camera-capture').onclick=()=>{if(!stream||busy||!video.videoWidth)return;draw(video,video.videoWidth,video.videoHeight);stopCamera();const ticket=++operation;analyze(ticket)};
$('#photo-pick').onclick=()=>{cancel();$('#photo-file').click()};
$('#photo-file').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;const ticket=++operation;$('#scan-answer').hidden=true;if(file.size>20*1024*1024){status.textContent='Elegí una foto de menos de 20 MB.';clearPhoto();return;}setBusy(true);status.textContent='Abriendo tu selfie…';const objectURL=URL.createObjectURL(file);try{const img=new Image();img.src=objectURL;await img.decode();if(ticket!==operation)return;draw(img,img.naturalWidth,img.naturalHeight);await analyze(ticket);}catch{if(ticket===operation){status.textContent='No pudimos abrir la foto. Probá con una imagen JPG o PNG.';clearPhoto();setBusy(false);}}finally{URL.revokeObjectURL(objectURL)}};
$('#scan-confirm').onclick=()=>{if(!suggestion)return;const chosen=suggestion;hide();window.selectFace(chosen);$('#face-results').scrollIntoView({behavior:'smooth',block:'start'});};
document.querySelectorAll('input[name="face"]').forEach(r=>r.addEventListener('change',hide));
window.addEventListener('pagehide',cancel);document.addEventListener('visibilitychange',()=>{if(document.hidden&&(stream||busy))cancel()});
