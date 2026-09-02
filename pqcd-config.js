/* ===================== CONFIGURACIÓN COMPARTIDA · Sistema PQCD ===================== */
/* Este archivo es la ÚNICA fuente de verdad para el proyecto de Firebase y la URL
   pública del sistema. Tanto index.html como dashboard.html lo cargan con
   <script src="pqcd-config.js"></script> ANTES de su propio <script> principal.
   Si el proyecto de Firebase cambia, o si el sitio se publica en otra URL,
   este es el ÚNICO lugar que hay que editar. */

const PQCD_FIREBASE_CONFIG = {
  apiKey: "AIzaSyA7IR1ge1BHdSvRgOhviE6w_d_1k1nT_6s",
  authDomain: "gestion-pqcd-hpm.firebaseapp.com",
  projectId: "gestion-pqcd-hpm",
  storageBucket: "gestion-pqcd-hpm.firebasestorage.app",
  messagingSenderId: "158942016338",
  appId: "1:158942016338:web:cf8da5f62af9151b02c08b"
};

/* URL pública donde vive index.html (para los QR de "editar reporte" y los
   enlaces ?reporte=... que genera el dashboard). */
const PQCD_PUBLISHED_URL = 'https://calidadbackupsistema-collab.github.io/Gestion_PQCD_HPM/index.html';

const PQCD_COLLECTION = 'pqcd_registros';

/* Inicializa Firebase (App + Auth anónima + Firestore) una sola vez y expone
   una promesa `PQCD_AUTH_READY` que TODAS las llamadas a Firestore deben
   esperar antes de leer o escribir. Sin sesión (anónima o real), las Reglas
   de Seguridad de Firestore (ver firestore.rules) rechazan la operación. */
const PQCD_FIREBASE_CONFIGURED = !Object.values(PQCD_FIREBASE_CONFIG).some(v=>String(v).includes('REEMPLAZAR'));
let PQCD_DB = null;
let PQCD_FIREBASE_READY = false;
let PQCD_AUTH_READY = Promise.resolve(false);

if (PQCD_FIREBASE_CONFIGURED && typeof firebase !== 'undefined') {
  try {
    if (!firebase.apps.length) firebase.initializeApp(PQCD_FIREBASE_CONFIG);
    PQCD_DB = firebase.firestore();
    PQCD_FIREBASE_READY = true;
    PQCD_AUTH_READY = new Promise((resolve) => {
      if (!firebase.auth) { resolve(false); return; }
      firebase.auth().onAuthStateChanged(user => {
        if (user) { resolve(true); return; }
        firebase.auth().signInAnonymously().then(()=>resolve(true)).catch(err=>{
          console.warn('No fue posible iniciar sesión anónima en Firebase.', err);
          resolve(false);
        });
      });
    });
  } catch (e) {
    console.warn('Firebase no se pudo inicializar, modo local.', e);
  }
}

/* Genera un ID de documento único e independiente del folio legible, para
   que dos auditorías distintas NUNCA se sobrescriban entre sí aunque
   coincidan en fecha+turno+máquina+modelo+lado. */
function pqcdNewDocId(){
  if (PQCD_FIREBASE_READY && PQCD_DB) return PQCD_DB.collection(PQCD_COLLECTION).doc().id;
  return 'local-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}
