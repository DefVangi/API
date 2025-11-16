document.addEventListener('DOMContentLoaded', () => {

const inputMoneda = document.getElementById('moneda_nacional');
const selectMoneda = document.getElementById('selector_moneda');
const btnConvertir = document.getElementById('btn_convertir');
const resultadoSpan = document.getElementById('resultado_conversion');
const ctx = document.getElementById('miGrafica').getContext('2d');

let graficaActual;

async function convertirMoneda() {
    const clp = Number(inputMoneda.value);
    const monedaATrasformar = selectMoneda.value;

    resultadoSpan.innerHTML = '';
    
    if (isNaN(clp) || clp <= 0) {
        resultadoSpan.innerHTML = '<p class="text-danger">Por favor, ingresa una cantidad válida de Pesos Chilenos.</p>';
        return;
    }
    
    if (monedaATrasformar === '') {
        resultadoSpan.innerHTML = '<p class="text-danger">Por favor, selecciona una moneda para convertir.</p>';
        return;
    }

    const url = `https://mindicador.cl/api/${monedaATrasformar}`;
    
    try {
        const respuesta = await fetch(url);
        
        if (!respuesta.ok) {
            throw new Error(`Error en la API: Código de estado ${respuesta.status}`);
        }
        
        const data = await respuesta.json();

        const valorActual = data.serie[0].valor;
        const nombreMoneda = data.codigo.toUpperCase();

        const resultado = (clp / valorActual).toFixed(2);
        resultadoSpan.innerHTML = 
            `<p class="text-success fs-4">Resultado: **$${resultado} ${nombreMoneda}**</p>`;

        renderizarGrafica(data.serie.slice(0, 10), nombreMoneda);

    } catch (error) {
        console.error("Ha ocurrido un error al obtener datos:", error.message);
        resultadoSpan.innerHTML = 
            `<p class="text-danger fw-bold">Error: ${error.message}. Por favor, inténtalo de nuevo más tarde.</p>`;
        
        if (graficaActual) {
            graficaActual.destroy();
        }
    }
}

function renderizarGrafica(datosHistorial, nombreMoneda) {
    
    if (graficaActual) {
        graficaActual.destroy();
    }

    const fechas = datosHistorial.map(item => item.fecha.substring(0, 10)).reverse();
    const valores = datosHistorial.map(item => item.valor).reverse();

    graficaActual = new Chart(ctx, {
        type: 'line',
        data: {
            labels: fechas, 
            datasets: [{
                label: `Valor de ${nombreMoneda} (CLP)`,
                data: valores, 
                borderColor: '#1C352D', 
                backgroundColor: 'rgba(28, 53, 45, 0.1)',
                borderWidth: 2,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Valor en CLP'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Día'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                },
                title: {
                    display: true,
                    text: `Historial de los últimos 10 días de ${nombreMoneda}`
                }
            }
        }
    });
}

btnConvertir.addEventListener('click', convertirMoneda);
}); 
