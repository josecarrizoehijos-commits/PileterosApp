// faq.js — Base de respuestas del asistente de José (modo FAQ, sin costo de IA)
// ======================================================================
// CÓMO EDITAR:
// - Cada bloque { } es una respuesta.
// - "titulo": el texto del botoncito (chip) que ve el usuario. Cortito.
// - "claves": palabras que, si aparecen en lo que escribe el usuario, disparan esta respuesta.
//             Poné varias formas de decir lo mismo (sinonimos, con y sin tilde, como habla la gente).
// - "resp": lo que contesta José. Podés usar:
//             **palabra** para negrita
//             líneas que empiezan con "- " para lista con puntos
//             líneas que empiezan con "1. " "2. " etc para lista numerada
// - "oculto": true = no aparece como botoncito (chip), pero SÍ se puede encontrar escribiendo.
//             false o sin ponerlo = aparece como botoncito.
// Para agregar una respuesta nueva, copiá un bloque entero, pegalo antes del "];" de abajo,
// y cambiá sus datos. No te olvides la coma "," entre un bloque y el siguiente.
// ======================================================================
window.FAQ_JOSE = [

{
  titulo: "12 Pasos",
  claves: ["12 pasos","doce pasos","pasos","metodo","método","cuales son los pasos","que son los 12 pasos"],
  resp: `Los **12 Pasos del Piletero** son el método que te voy enseñando acá en la app, con video y checklist en cada uno:

1. Inspección general: mirá color y claridad del agua, hojas, nivel y que no haya ruidos raros en los equipos.
2. Sacar las hojitas con la red, antes de aspirar.
3. Retrolavar: limpiar la arena del filtro.
4. Poner a filtrar.
5. Preparar los elementos: manguera, limpiafondo, cabo y red.
6. Llenar la manguera de agua antes de conectarla.
7. Poner el limpiafondo.
8. Barrer el fondo, despacio y ordenado.
9. Sacar el barrefondo sin que entre aire a la cañería.
10. Limpiar los canastitos (skimmer y prefiltro de la bomba).
11. Medir pH y cloro.
12. Tirar los productos químicos según las tablas de la app.

Los tenés con video paso a paso en la sección **12 Pasos** de la app. ¿Hay alguno que te esté complicando?`
},

{
  titulo: "Selector / válvula",
  claves: ["selector","valvula","válvula","multivia","multivía","posiciones de la valvula","perilla"],
  resp: `La **válvula selectora** (multivía) tiene 6 posiciones, en sentido horario:

1. **Filtrar**: el agua pasa por la arena y vuelve limpia (posición normal).
2. **Desagotar**: el agua va directo al desagüe, sin pasar por el filtro.
3. **Cerrar**: corta el paso del agua. Nunca enciendas la bomba en esta posición.
4. **Retrolavar**: el agua entra al revés y arrastra la suciedad al desagüe.
5. **Recircular**: pasa por la bomba y vuelve a la pileta sin pasar por la arena.
6. **Enjuagar**: después del retrolavado, asienta la arena.

**Regla de oro**: apagá siempre la bomba antes de mover la manija del selector.`
},

{
  titulo: "Bomba trabada",
  claves: ["bomba trabada","bomba no gira","bomba zumba","bomba hace ruido","motor trabado","bomba no arranca"],
  resp: `Si la bomba está trabada o zumba y no gira:

- Cortá la energía de inmediato.
- Revisá que no haya hojas o suciedad en el prefiltro, y que el eje no esté trabado por falta de uso.
- No metas las manos con la bomba conectada.

Si sigue trabada, o notás olor a quemado, calor excesivo o chispas, **no insistas**: escribime por WhatsApp o llamá a un técnico.`
},

{
  titulo: "La bomba no enciende",
  claves: ["la bomba no enciende","no prende la bomba","bomba no arranca","bomba no prende","no anda la bomba"],
  resp: `Si la bomba no enciende, probá en este orden:

1. **Verificá que llegue electricidad**: fijate si no saltó una térmica, y con un buscapolo (o preguntando si hay luz en la casa) confirmá que llegue corriente al tomacorriente o al tablero de la bomba.
2. Si hay electricidad y aun así no prende, puede estar **trabada mecánicamente**: sacá la tapa que cubre el ventilador de atrás del motor y girá el eje a mano para destrabarla. Volvé a poner la tapa y probá encenderla. Esto es muy común, sobre todo si la bomba estuvo bastante tiempo sin usarse.

Por eso conviene hacer andar la bomba cada cierto tiempo, aunque no se esté usando la pileta, para que no se trabe.

Si hiciste los dos pasos y sigue sin andar, avisale al cliente que probaste esto y aquello y que la bomba va a necesitar que la lleven a revisar con un técnico.`
},

{
  titulo: "Bomba no succiona",
  claves: ["bomba no succiona","no se cebo","no se cebó","bomba no aspira","bomba sin agua","no toma agua"],
  resp: `Si la bomba no succiona o no se cebó, revisá en este orden:

- Que el nivel de agua llegue al skimmer.
- Que el canastito y el prefiltro no estén tapados.
- Que la tapa del prefiltro cierre bien, con la junta en buen estado.
- Que todas las válvulas de succión estén abiertas.

Llená de agua el prefiltro antes de encender la bomba.`
},

{
  titulo: "Agua verde",
  claves: ["agua verde","pileta verde","piscina verde","algas"],
  resp: `Para el agua verde (algas), seguí este orden:

1. Medí y corregí el **pH** primero.
2. Cepillá paredes y fondo.
3. Aplicá el tratamiento de cloro según la etiqueta y las tablas de la app.
4. Filtrá sin parar y retrolavá cuando suba la presión.

Nunca mezcles productos entre sí.`
},

{
  titulo: "Agua turbia",
  claves: ["agua turbia","agua lechosa","agua blanca","agua nublada","agua opaca"],
  resp: `El agua turbia o lechosa suele ser por filtración insuficiente, pH desajustado o filtro sucio.

- Medí pH y cloro.
- Retrolavá el filtro.
- Filtrá más horas de las habituales.
- Volvé a medir al otro día.`
},

{
  titulo: "pH alto o bajo",
  claves: ["ph alto","ph bajo","ph","subir el ph","bajar el ph","regular el ph"],
  resp: `Valores de referencia: **pH entre 7,2 y 7,6**, cloro libre entre 1 y 3 ppm.

Para corregir el pH, usá el producto indicado según las tablas de la app y la etiqueta, de a poco y con la bomba funcionando. Volvé a medir después de unas horas antes de agregar más.`
},

{
  titulo: "Seguridad y químicos",
  claves: ["seguridad","quimicos","químicos","productos quimicos","cuidado","peligro","mezclar productos"],
  resp: `Reglas de seguridad que no se negocian:

- Cortá la energía antes de abrir o tocar la bomba o cualquier equipo eléctrico. Nunca toques algo eléctrico con las manos mojadas.
- Usá guantes y gafas para manipular productos químicos.
- **Nunca mezcles productos entre sí.**
- Guardalos cerrados, en lugar fresco y lejos de los chicos.
- Para dosis y cantidades, usá siempre las tablas de la app y la etiqueta del producto.`
},

{
  titulo: "Presión alta",
  oculto: true,
  claves: ["presion alta","manometro","manómetro","presion del filtro"],
  resp: `Si el manómetro marca presión alta, generalmente es el filtro sucio: hacé el retrolavado y el enjuague.

Si la presión sigue alta después de retrolavar, puede haber cañería tapada o arena apelmazada. En ese caso escribime por WhatsApp.`
},

{
  titulo: "Poca fuerza de agua",
  oculto: true,
  claves: ["poca fuerza","poco caudal","sale poca agua","chorro debil","chorro débil"],
  resp: `Si sale poca fuerza de agua o poco caudal, revisá:

- Los canastitos del skimmer y del prefiltro.
- Si entra aire (burbujas en el prefiltro).
- Si el filtro necesita un retrolavado.`
},

{
  titulo: "Filtro devuelve arena",
  oculto: true,
  claves: ["filtro devuelve arena","sale arena","arena en la pileta","arena en la piscina"],
  resp: `Si el filtro devuelve arena a la pileta, puede haber un lateral roto adentro del filtro. No es algo para resolver solo: escribime por WhatsApp y lo vemos.`
},

{
  titulo: "Selector pierde agua",
  oculto: true,
  claves: ["selector pierde agua","valvula pierde","válvula pierde","pierde agua la valvula"],
  resp: `Si la válvula selectora pierde agua, revisá las juntas y o-rings de la tapa. Si la pérdida es de la válvula en sí, hay que cambiar el repuesto: mejor que lo veamos juntos, escribime por WhatsApp.`
},

{
  titulo: "Limpiafondo no anda",
  oculto: true,
  claves: ["limpiafondo no anda","limpiafondo no mueve","limpiafondo no aspira","barrefondo no anda"],
  resp: `Si el limpiafondo no se mueve o no aspira, revisá:

- Que la manguera esté llena de agua, sin aire adentro.
- Que los canastitos estén limpios.
- El nivel de agua de la pileta.
- Que no haya hojas trabadas en el equipo.`
},

{
  titulo: "Limpiafondo pierde succión",
  claves: ["limpiafondo deja de succionar","pierde succion","pierde succión","deja de aspirar","se corta la succion","se corta la succión","dejo de succionar","barriendo deja de aspirar"],
  resp: `Si estás barriendo el fondo con el limpiafondo y de repente **deja de succionar**, andá revisando en este orden:

1. Subí un poco el limpiafondo (sin sacarlo del agua, solo cerca de la superficie) y fijate con la mano si quedaron hojitas o ramitas trabadas ahí. Si hay, las sacás y listo.
2. Si no tenía nada, bajá el limpiafondo de nuevo y fijate en el otro extremo: la toma del skimmer (o la toma de limpiafondo). Buscá hojitas trabadas ahí, sin sacar la manguera del agua.
3. Si tampoco encontrás nada, apagá la bomba y fijate si el canastito del prefiltro de la bomba está lleno.

Si corroboraste los tres y sigue sin succionar, puede ser que el filtro esté saturado por no haber hecho el retrolavado antes de barrer. En ese caso: apagá la bomba, hacé un **retrolavado** y un **enjuague**, y volvé a probar.`
}

];
