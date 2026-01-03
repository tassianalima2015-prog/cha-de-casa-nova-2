// script.js (arquivo em módulo)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  runTransaction,
  getDoc,
  getDocs,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {

  // --- CONFIGURAÇÃO DO FIREBASE ---
  const firebaseConfig = {
    apiKey: "AIzaSyB9gTaojRXu7J7g7yI7Hw_9lb3yDMr1ydg",
    authDomain: "cha-de-casa-nova-9034c.firebaseapp.com",
    projectId: "cha-de-casa-nova-9034c",
    storageBucket: "cha-de-casa-nova-9034c.firebasestorage.app",
    messagingSenderId: "396610857130",
    appId: "1:396610857130:web:14590d41081486e57048d3"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const presentesColl = collection(db, "presentes");

  // --- LISTA ATUALIZADA DE PRESENTES ---
  const defaultItems = [
    { id: "lencol_fronha_casal", name: "Lençol e fronha casal", buyer: "", bought: false },
    { id: "cobre_leito", name: "Cobre leito", buyer: "", bought: false },
    { id: "protetor_colchao", name: "Protetor de colchão", buyer: "", bought: false },
    { id: "travesseiros", name: "Travesseiros", buyer: "", bought: false },
    { id: "kit_vassoura_rodo_pa", name: "Kit vassoura + rodo + pá", buyer: "", bought: false },
    { id: "mop", name: "Mop", buyer: "", bought: false },
    { id: "cortina_quarto_1", name: "Cortina para quarto 1", buyer: "", bought: false },
    { id: "cortina_quarto_2", name: "Cortina para quarto 2", buyer: "", bought: false },
    { id: "cortina_sala_estar", name: "Cortina para sala de estar", buyer: "", bought: false },
    { id: "cortina_grande_sala_jantar", name: "Cortina grande para sala de jantar", buyer: "", bought: false },
    { id: "pano_chao_prato", name: "Pano de chão + de prato", buyer: "", bought: false },
    { id: "cesto_roupa_suja", name: "Cesto de roupa suja", buyer: "", bought: false },
    { id: "jogo_toalhas", name: "Jogo de toalhas", buyer: "", bought: false },
    { id: "conjunto_panelas", name: "Conjunto de panelas", buyer: "", bought: false },
    { id: "jogo_pratos", name: "Jogo de pratos", buyer: "", bought: false },
    { id: "jogo_sobremesa", name: "Jogo de sobremesa", buyer: "", bought: false },
    { id: "xicaras", name: "Xícaras", buyer: "", bought: false },
    { id: "tacas", name: "Taças", buyer: "", bought: false },
    { id: "potes_hermeticos", name: "Potes herméticos", buyer: "", bought: false },
    { id: "queijeira", name: "Queijeira", buyer: "", bought: false },
    { id: "travessas", name: "Travessas", buyer: "", bought: false },
    { id: "jogo_assadeiras", name: "Jogo de assadeiras", buyer: "", bought: false },
    { id: "mixer", name: "Mixer", buyer: "", bought: false },
    { id: "jogo_americano", name: "Jogo americano", buyer: "", bought: false },
    { id: "jogo_talheres", name: "Jogo de talheres", buyer: "", bought: false },
    { id: "jogo_facas_cortes", name: "Jogo de facas de cortes", buyer: "", bought: false },
    { id: "panela_pressao", name: "Panela de pressão", buyer: "", bought: false },
    { id: "liquidificador", name: "Liquidificador", buyer: "", bought: false },
    { id: "batedeira", name: "Batedeira", buyer: "", bought: false },
    { id: "sanduicheira", name: "Sanduicheira", buyer: "", bought: false },
    { id: "ventilador", name: "Ventilador", buyer: "", bought: false },
    { id: "ferro_passar_roupa", name: "Ferro de passar roupa", buyer: "", bought: false }
  ];

  const listaEl = document.getElementById("lista-presentes");
  const statusEl = document.getElementById("status");

  // --- SINCRONIZA FIRESTORE COM A LISTA ATUAL ---
  async function syncItems() {
    const snapshot = await getDocs(presentesColl);
    const firestoreIds = snapshot.docs.map(d => d.id);
    const localIds = defaultItems.map(i => i.id);

    // adiciona novos
    for (const item of defaultItems) {
      if (!firestoreIds.includes(item.id)) {
        await setDoc(doc(presentesColl, item.id), item);
      }
    }

    // remove antigos
    for (const id of firestoreIds) {
      if (!localIds.includes(id)) {
        await deleteDoc(doc(presentesColl, id));
      }
    }
  }

  // --- RENDERIZA ITEM ---
  function renderItem(item) {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    li.style.padding = "8px";
    li.style.marginBottom = "6px";
    li.style.borderRadius = "6px";
    li.style.backgroundColor = item.bought ? "#d4edda" : "#fff3cd";

    const info = document.createElement("div");
    const name = document.createElement("div");
    name.textContent = item.name;
    name.style.fontWeight = "bold";

    const meta = document.createElement("div");
    meta.textContent = item.bought ? `Comprado por: ${item.buyer}` : "Disponível";

    info.appendChild(name);
    info.appendChild(meta);

    const btn = document.createElement("button");
    btn.textContent = item.bought ? "Desmarcar ✔" : "Marcar como comprado";

    btn.onclick = async () => {
      const ref = doc(db, "presentes", item.id);
      await runTransaction(db, async (t) => {
        const snap = await t.get(ref);
        const data = snap.data();

        if (!data.bought) {
          const nome = prompt("Digite seu nome:");
          if (!nome) return;
          t.update(ref, { bought: true, buyer: nome });
        } else {
          t.update(ref, { bought: false, buyer: "" });
        }
      });
    };

    li.appendChild(info);
    li.appendChild(btn);
    return li;
  }

  // --- INICIALIZA ---
  await syncItems();

  onSnapshot(presentesColl, (snapshot) => {
    listaEl.innerHTML = "";
    snapshot.forEach(doc => {
      listaEl.appendChild(renderItem(doc.data()));
    });
    statusEl.textContent = "Lista atualizada em tempo real";
  });

});
