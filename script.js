document.addEventListener('DOMContentLoaded', () => {
    // Seleciona os elementos do DOM
    const modoNoturnoBtn = document.getElementById('modoNoturnoBtn');
    const themeSelect = document.getElementById('themeSelect');
    const modoComparacaoBtn = document.getElementById('modoComparacaoBtn');
    const modoAvancadoBtn = document.getElementById('modoAvancadoBtn');
    const texto1 = document.getElementById('texto1');
    const texto2 = document.getElementById('texto2');
    const dashboard1 = document.getElementById('dashboard1');
    const dashboard2 = document.getElementById('dashboard2');
    const dash2 = document.getElementById('dash2');
    const comparisonContainer = document.getElementById('comparisonContainer');
    const comparisonResults = document.getElementById('comparisonResults');
    const clearBtn = document.querySelector('.clear-btn');
    const exportBtn = document.querySelector('.export-btn');

    // Verifica se os elementos foram encontrados
    console.log('modoAvancadoBtn:', modoAvancadoBtn, 'dash2:', dash2, 'comparisonContainer:', comparisonContainer);

    // Variáveis de estado
    let modoComparacao = false;
    let modoAvancado = false;
    let isDashboard1Animated = false; // Controle pra animação inicial
    let isDashboard2Animated = false; // Controle pra animação inicial
    let isAdvancedModeAnimated = false; // Controle pra animação do modo avançado
    let temaAtualIndex = 0; // Índice do tema atual
    const temas = ['default', 'purple', 'green', 'orange']; // Lista de temas

    // Função de debounce pra limitar atualizações frequentes
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Adiciona eventos aos elementos
    if (modoNoturnoBtn) modoNoturnoBtn.addEventListener('change', alternarModoNoturno);
    if (themeSelect) themeSelect.addEventListener('change', alternarTema);
    if (modoAvancadoBtn) modoAvancadoBtn.addEventListener('click', toggleModoAvancado);
    if (clearBtn) clearBtn.addEventListener('click', limparTudo);
    if (exportBtn) exportBtn.addEventListener('click', exportarResultados);
    if (texto1) texto1.addEventListener('input', debounce(() => analisarTexto(texto1.value, 'dashboard1', 'Dashboard 1'), 300));
    if (texto2) {
        texto2.addEventListener('input', debounce(() => {
            if (modoComparacao) {
                analisarTexto(texto2.value, 'dashboard2', 'Dashboard 2');
                compararTextos();
            }
        }, 300));
    }

    // Função pra alternar o modo noturno
    function alternarModoNoturno() {
        if (document.body) document.body.classList.toggle('modo-noturno');
    }

    // Função pra alternar o tema
    function alternarTema() {
        if (themeSelect && document.body) {
            const tema = themeSelect.value;
            document.body.classList.remove('theme-default', 'theme-purple', 'theme-green', 'theme-orange');
            if (tema !== 'default') document.body.classList.add(`theme-${tema}`);
        }
    }

    // Função pra mudar o tema (ciclo)
    function mudarTema() {
        temaAtualIndex = (temaAtualIndex + 1) % temas.length;
        const novoTema = temas[temaAtualIndex];
        if (themeSelect) themeSelect.value = novoTema;
        document.body.classList.remove('theme-default', 'theme-purple', 'theme-green', 'theme-orange');
        if (novoTema !== 'default') document.body.classList.add(`theme-${novoTema}`);
        console.log('Tema alterado para:', novoTema);
    }

    // Função pra ativar/desativar o modo avançado
    function toggleModoAvancado() {
        if (modoAvancadoBtn) {
            const wasAdvanced = modoAvancado;
            modoAvancado = !modoAvancado;
            console.log('Modo Avançado antes da troca:', wasAdvanced, 'depois:', modoAvancado);
            if (texto1 && texto1.value.trim() && dashboard1) {
                console.log('Atualizando dashboard1 com texto:', texto1.value);
                analisarTexto(texto1.value, 'dashboard1', 'Dashboard 1');
            }
            const novoTextoBotao = modoAvancado ? 'Modo Simples' : 'Modo Avançado';
            console.log('Mudando texto do botão para:', novoTextoBotao);
            modoAvancadoBtn.textContent = novoTextoBotao;
            console.log('Modo Avançado após a troca:', modoAvancado);

            if (!wasAdvanced && modoAvancado) {
                isAdvancedModeAnimated = false;
                console.log('Modo avançado ativado, resetando animação para os novos itens');
            }
        }
    }

    // Função pra limpar tudo
    function limparTudo() {
        if (texto1) texto1.value = '';
        if (texto2) texto2.value = '';
        if (dashboard1) {
            dashboard1.innerHTML = '';
            isDashboard1Animated = false;
            console.log('Animação do dashboard1 resetada');
        }
        if (dashboard2) {
            dashboard2.innerHTML = '';
            isDashboard2Animated = false;
            console.log('Animação do dashboard2 resetada');
        }
        if (comparisonResults) comparisonResults.innerHTML = '';
        isAdvancedModeAnimated = false;
        console.log('Animação do modo avançado resetada');
    }

    // Função pra apagar só o texto
    function limparTexto() {
        if (texto1) texto1.value = '';
        if (texto2) texto2.value = '';
        console.log('Texto apagado');
    }

    // Função pra exportar resultados como PDF
    function exportarResultados() {
        // Verifica se o jsPDF e html2canvas estão disponíveis
        const { jsPDF } = window.jspdf;
        if (!jsPDF || !window.html2canvas) {
            console.error('jsPDF ou html2canvas não estão disponíveis. Verifique se os scripts foram incluídos.');
            alert('Erro: Não foi possível exportar o PDF. Verifique o console para mais detalhes.');
            return;
        }

        // Seleciona os dashboards pra exportar
        const dashboards = [dashboard1];
        if (modoComparacao && dashboard2) {
            dashboards.push(dashboard2);
        }

        if (dashboards.length === 0 || !dashboards[0].innerHTML.trim()) {
            console.log('Nenhum dashboard disponível para exportar.');
            alert('Nenhum conteúdo disponível para exportar.');
            return;
        }

        // Cria um novo documento PDF
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Adiciona o texto digitado na primeira página
        let currentY = 10; // Posição inicial no eixo Y
        pdf.setFontSize(16);
        pdf.text('Texto Digitado', 10, currentY);
        currentY += 10;

        pdf.setFontSize(12);
        const margin = 10;
        const pageWidth = pdf.internal.pageSize.getWidth() - 2 * margin;

        // Função pra adicionar texto com quebra automática
        const addTextToPDF = (text, title) => {
            if (text && text.trim()) {
                pdf.setFontSize(14);
                pdf.text(title, margin, currentY);
                currentY += 7;

                pdf.setFontSize(12);
                const lines = pdf.splitTextToSize(text, pageWidth);
                lines.forEach(line => {
                    if (currentY + 5 > pdf.internal.pageSize.getHeight() - margin) {
                        pdf.addPage();
                        currentY = margin;
                    }
                    pdf.text(line, margin, currentY);
                    currentY += 5;
                });
                currentY += 5; // Espaço extra entre textos
            }
        };

        // Adiciona o texto1
        addTextToPDF(texto1 ? texto1.value : '', 'Texto 1:');

        // Adiciona o texto2 (se no modo comparação)
        if (modoComparacao && texto2) {
            addTextToPDF(texto2.value, 'Texto 2:');
        }

        // Adiciona uma nova página pro dashboard se o texto ocupou espaço
        if (currentY > margin) {
            pdf.addPage();
            currentY = margin;
        }

        // Função pra capturar e adicionar cada dashboard ao PDF
        const addDashboardToPDF = (dashboard, index) => {
            return html2canvas(dashboard, { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth() - 2 * margin;
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                // Adiciona uma nova página pro dashboard (exceto se for o primeiro e não tiver texto)
                if (index > 0 || currentY > margin) {
                    pdf.addPage();
                }

                pdf.addImage(imgData, 'PNG', margin, margin, pdfWidth, pdfHeight);
            });
        };

        // Processa cada dashboard e adiciona ao PDF
        Promise.all(dashboards.map((dashboard, index) => addDashboardToPDF(dashboard, index)))
            .then(() => {
                pdf.save('analise_texto.pdf');
                console.log('PDF exportado com sucesso!');
            })
            .catch(err => {
                console.error('Erro ao exportar PDF:', err);
                alert('Erro ao exportar PDF. Verifique o console para mais detalhes.');
            });
    }

    // Função pra copiar o texto pra área de transferência
    function copiarTexto() {
        const texto = texto1 ? texto1.value : (texto2 ? texto2.value : '');
        if (texto) {
            navigator.clipboard.writeText(texto).then(() => {
                console.log('Texto copiado com sucesso!');
                alert('Texto copiado para a área de transferência!');
            }).catch(err => console.error('Erro ao copiar texto:', err));
        } else {
            console.log('Nenhum texto disponível para copiar.');
        }
    }

    // Função pra lidar com atalhos de teclado
    function handleKeyboardShortcuts(event) {
        // Verifica combinações de teclas com Shift
        if (event.shiftKey) {
            switch (event.key.toLowerCase()) {
                case 'a': // Shift + A: Alternar modo avançado
                    event.preventDefault();
                    toggleModoAvancado();
                    console.log('Shift + A pressionado: Alternando modo avançado');
                    break;
                case 'n': // Shift + N: Alternar modo noturno
                    event.preventDefault();
                    alternarModoNoturno();
                    console.log('Shift + N pressionado: Alternando modo noturno');
                    break;
                case 's': // Shift + S: Copiar texto pra área de transferência
                    event.preventDefault();
                    copiarTexto();
                    break;
                case 'e': // Shift + E: Apagar o texto
                    event.preventDefault();
                    limparTexto();
                    break;
                case 'j': // Shift + J: Exportar como PDF
                    event.preventDefault();
                    exportarResultados();
                    console.log('Shift + J pressionado: Exportando como PDF');
                    break;
                case 'arrowright': // Shift + Seta Direita: Mudar o tema
                    event.preventDefault();
                    mudarTema();
                    break;
            }
        }
    }

    // Adiciona o event listener para teclas
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Função principal pra analisar o texto e atualizar o dashboard
    function analisarTexto(texto, dashboardId, title) {
        const dashboardDiv = document.getElementById(dashboardId);
        if (!dashboardDiv || !texto.trim()) {
            if (dashboardDiv) dashboardDiv.innerHTML = '';
            return;
        }

        console.log(`Atualizando ${dashboardId} com texto: "${texto}"`);

        // Cálculos básicos
        const totalPalavras = texto.split(/\s+/).filter(word => word.length > 0).length;
        const totalCaracteres = texto.length;
        const caracteresSemEspaco = texto.replace(/\s/g, '').length;
        const frases = texto.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
        const paragrafos = texto.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0).length;

        // Cálculos do modo avançado (inicializados com valores padrão)
        let palavrasUnicas = 0, mediaCaracteresPorPalavra = 0, tempoLeituraMinutos = 0, palavrasPorFrase = 0;
        let indiceRedundancia = 0, nivelRedundancia = '', nivelRedundanciaClasse = '';
        let gunningFog = 0, nivelLegibilidade = '', nivelClasse = '';
        let feedbackComprimento = '', feedbackLegibilidade = '', feedbackRedundancia = '';
        let sugestoesContent = '', tickerContent = '', feedbackContent = '', sugestoes = [];

        if (modoAvancado) {
            const palavras = texto.toLowerCase().split(/\s+/).filter(word => word.length > 0);
            const palavrasSet = new Set(palavras);
            palavrasUnicas = palavrasSet.size;
            mediaCaracteresPorPalavra = palavras.length > 0 ? (caracteresSemEspaco / palavras.length).toFixed(2) : 0;
            tempoLeituraMinutos = Math.ceil(totalPalavras / 200);
            palavrasPorFrase = frases > 0 ? (totalPalavras / frases).toFixed(2) : 0;
            indiceRedundancia = palavras.length > 0 ? ((1 - palavrasUnicas / palavras.length) * 100).toFixed(2) : 0;
            nivelRedundancia = indiceRedundancia < 15 ? 'Excelente' : indiceRedundancia < 30 ? 'Bom' : indiceRedundancia < 50 ? 'Regular' : 'Ruim';
            nivelRedundanciaClasse = nivelRedundancia.toLowerCase();

            const palavrasComplexas = palavras.filter(word => word.length > 6).length;
            const mediaPalavrasPorFrase = palavrasPorFrase;
            gunningFog = 0.4 * (mediaPalavrasPorFrase + (palavrasComplexas / totalPalavras) * 100);
            gunningFog = isNaN(gunningFog) || !isFinite(gunningFog) ? 0 : gunningFog.toFixed(2);
            nivelLegibilidade = gunningFog < 10 ? 'Muito Fácil' : gunningFog < 15 ? 'Fácil' : gunningFog < 20 ? 'Médio' : 'Difícil';
            nivelClasse = nivelLegibilidade.toLowerCase().replace('muito fácil', 'muito-facil');

            feedbackComprimento = totalPalavras < 500 ? 'Muito Curto' : totalPalavras < 1200 ? 'Redes Sociais' : totalPalavras < 5000 ? 'Blog' : 'Muito Longo';
            feedbackLegibilidade = `A legibilidade do texto é ${nivelLegibilidade.toLowerCase()} (Índice Gunning Fog: ${gunningFog}).`;
            feedbackRedundancia = `O índice de redundância é ${indiceRedundancia}% (${nivelRedundancia.toLowerCase()}).`;

            if (totalPalavras < 500) sugestoes.push('<li><span>Aumentar o comprimento:</span> Adicione mais detalhes ou exemplos.</li>');
            if (indiceRedundancia > 30) sugestoes.push('<li><span>Reduzir redundância:</span> Use sinônimos.</li>');
            if (gunningFog > 15) sugestoes.push('<li><span>Melhorar legibilidade:</span> Use frases curtas.</li>');

            feedbackContent = `
                <div class="feedback-card">
                    <h3>Feedback do Texto</h3>
                    <div class="section"><p>${feedbackComprimento}</p><p>${feedbackLegibilidade}</p><p>${feedbackRedundancia}</p></div>
                    <button class="copy-feedback-btn">Copiar Feedback</button>
                </div>
            `;
            sugestoesContent = sugestoes.length > 0 ? `<div class="suggestions-card"><h3>Sugestões de Melhoria</h3><ul>${sugestoes.join('')}</ul></div>` : '';
            tickerContent = `
                <div class="ticker-card">
                    <h3 class="ticker-title">Dicas Rápidas</h3>
                    <div class="ticker-container"><div class="ticker"><span>Use parágrafos curtos.</span><span>Evite jargões.</span><span>Revise a pontuação.</span><span>Adicione subtítulos.</span></div></div>
                </div>
            `;
        }

        // Estrutura base do dashboard (criada uma vez)
        let titleCard = dashboardDiv.querySelector('.dashboard-title-card');
        if (!titleCard) {
            titleCard = document.createElement('div');
            titleCard.className = 'dashboard-title-card';
            titleCard.innerHTML = '<h2 class="dashboard-title"></h2>';
            dashboardDiv.appendChild(titleCard);
        }
        titleCard.querySelector('.dashboard-title').textContent = title;

        let metricsDiv = dashboardDiv.querySelector('.metrics');
        if (!metricsDiv) {
            metricsDiv = document.createElement('div');
            metricsDiv.className = 'metrics';
            dashboardDiv.appendChild(metricsDiv);
        }

        // Métricas básicas - Adiciona uma classe única pra cada métrica
        const baseMetrics = [
            { class: 'palavras', icon: 'fas fa-align-left', label: 'palavras', value: totalPalavras },
            { class: 'caracteres-com-espacos', icon: 'fas fa-text-width', label: 'caracteres-com-espacos', value: totalCaracteres },
            { class: 'caracteres-sem-espacos', icon: 'fas fa-text-height', label: 'caracteres-sem-espacos', value: caracteresSemEspaco },
            { class: 'frases', icon: 'fas fa-paragraph', label: 'frases', value: frases },
            { class: 'paragrafos', icon: 'fas fa-file-alt', label: 'paragrafos', value: paragrafos }
        ];

        baseMetrics.forEach(metric => {
            let card = metricsDiv.querySelector(`.metric-card.${metric.class}`);
            if (!card) {
                card = document.createElement('div');
                card.className = `metric-card ${metric.class}`.trim();
                const labelText = metric.label.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                card.innerHTML = `
                    <p class="metric-clickable" data-details="Detalhes sobre ${metric.label}: inclui cálculos específicos.">
                        <i class="${metric.icon}"></i>
                        <span class="metric-label">${labelText}:</span>
                        <span class="metric-value"></span>
                    </p>`;
                metricsDiv.appendChild(card);
            }
            card.querySelector('.metric-value').textContent = metric.value.toLocaleString();
        });

        // Métricas avançadas - Adiciona uma classe única pra cada métrica
        if (modoAvancado) {
            const advancedMetrics = [
                { class: 'palavras-unicas', icon: 'fas fa-star', label: 'Palavras Únicas', value: palavrasUnicas },
                { class: 'media-caracteres', icon: 'fas fa-ruler', label: 'Média de Caracteres por Palavra', value: mediaCaracteresPorPalavra },
                { class: 'tempo-leitura', icon: 'fas fa-clock', label: 'Tempo de Leitura Estimado', value: `${tempoLeituraMinutos} minuto${tempoLeituraMinutos !== 1 ? 's' : ''}` },
                { class: 'palavras-por-frase', icon: 'fas fa-list-ol', label: 'Palavras por Frase', value: palavrasPorFrase },
                { class: `indice-redundancia ${nivelRedundanciaClasse}`, icon: 'fas fa-sync', label: 'Índice de Redundância', value: `${indiceRedundancia}% (${nivelRedundancia})`, tooltip: 'Porcentagem de palavras repetidas: Excelente (<15%), Bom (15-30%), Regular (30-50%), Ruim (>50%).' },
                { class: 'comprimento-texto', icon: 'fas fa-book', label: 'Comprimento do Texto', value: feedbackComprimento, tooltip: 'Muito Curto (<500), Redes Sociais (500-1200), Blog (1200-5000), Muito Longo (>5000).' },
                { class: `gunning-fog ${nivelClasse}`, icon: 'fas fa-chart-line', label: 'Índice Gunning Fog', value: `${gunningFog} (${nivelLegibilidade})`, tooltip: 'Índice de legibilidade: Muito Fácil (<10), Fácil (10-15), Médio (15-20), Difícil (>20).' }
            ];

            advancedMetrics.forEach(metric => {
                let card = metricsDiv.querySelector(`.metric-card.${metric.class.split(' ')[0]}`); // Usa apenas a primeira classe pra buscar
                if (!card) {
                    card = document.createElement('div');
                    card.className = `metric-card ${metric.class} advanced-only`.trim();
                    const hasTooltip = metric.tooltip;
                    const pClass = hasTooltip ? 'metric-clickable tooltip' : 'metric-clickable';
                    const tooltipAttr = hasTooltip ? `data-tooltip="${metric.tooltip}"` : '';
                    card.innerHTML = `
                        <p class="${pClass}" ${tooltipAttr} data-details="Detalhes sobre ${metric.label.toLowerCase()}: inclui cálculos avançados.">
                            <i class="${metric.icon}"></i>
                            <span class="metric-label">${metric.label}:</span>
                            <span class="metric-value"></span>
                        </p>` + (metric.class.includes('gunning-fog') ? '<div class="gunning-fog-meter ' + nivelClasse + '"><div class="progress"></div></div>' : '');
                    metricsDiv.appendChild(card);
                }
                card.querySelector('.metric-value').textContent = metric.value.toLocaleString ? metric.value.toLocaleString() : metric.value;
            });

            // Remove métricas avançadas que não estão mais presentes
            metricsDiv.querySelectorAll('.metric-card.advanced-only').forEach(card => {
                const metricClass = card.className.split(' ').find(cls => cls !== 'metric-card' && cls !== 'advanced-only' && !cls.includes('excelente') && !cls.includes('muito-facil') && !cls.includes('facil') && !cls.includes('medio') && !cls.includes('dificil'));
                const shouldExist = advancedMetrics.some(m => m.class.includes(metricClass));
                if (!shouldExist) card.remove();
            });
        } else {
            // Remove todas as métricas avançadas no modo simples
            metricsDiv.querySelectorAll('.metric-card.advanced-only').forEach(card => card.remove());
        }

        // Ticker, Feedback e Sugestões
        let tickerCard = dashboardDiv.querySelector('.ticker-card');
        if (modoAvancado && !tickerCard) {
            tickerCard = document.createElement('div');
            tickerCard.className = 'ticker-card';
            tickerCard.innerHTML = tickerContent;
            dashboardDiv.insertBefore(tickerCard, metricsDiv);
        } else if (!modoAvancado && tickerCard) {
            tickerCard.remove();
        }

        let feedbackCard = dashboardDiv.querySelector('.feedback-card');
        if (modoAvancado && feedbackContent && !feedbackCard) {
            feedbackCard = document.createElement('div');
            feedbackCard.className = 'feedback-card';
            feedbackCard.innerHTML = feedbackContent;
            dashboardDiv.appendChild(feedbackCard);
        } else if (!modoAvancado && feedbackCard) {
            feedbackCard.remove();
        }

        let suggestionsCard = dashboardDiv.querySelector('.suggestions-card');
        if (modoAvancado && sugestoesContent && !suggestionsCard) {
            suggestionsCard = document.createElement('div');
            suggestionsCard.className = 'suggestions-card';
            suggestionsCard.innerHTML = sugestoesContent;
            dashboardDiv.insertBefore(suggestionsCard, feedbackCard || metricsDiv.nextSibling);
        } else if (!modoAvancado && suggestionsCard) {
            suggestionsCard.remove();
        }

        // Aplica animação
        const allCards = dashboardDiv.querySelectorAll('.metric-card, .feedback-card, .ticker-card, .suggestions-card');
        const isInitialAnimated = dashboardId === 'dashboard1' ? isDashboard1Animated : isDashboard2Animated;
        const shouldAnimateInitial = !isInitialAnimated;
        const shouldAnimateAdvanced = !isAdvancedModeAnimated && modoAvancado;

        if (shouldAnimateInitial) {
            console.log(`Aplicando animação inicial (fadeInUp) no ${dashboardId}`);
            allCards.forEach((card, index) => {
                card.style.animation = 'fadeInUp 0.8s ease-out forwards';
                card.style.animationDelay = `${index * 0.1}s`;
            });
            if (dashboardId === 'dashboard1') isDashboard1Animated = true;
            else if (dashboardId === 'dashboard2') isDashboard2Animated = true;
        } else if (shouldAnimateAdvanced) {
            console.log(`Aplicando animação do modo avançado (fadeInUp) no ${dashboardId} - apenas itens novos`);
            const advancedCards = dashboardDiv.querySelectorAll('.advanced-only, .feedback-card, .ticker-card, .suggestions-card');
            advancedCards.forEach((card, index) => {
                card.style.animation = 'fadeInUp 0.8s ease-out forwards';
                card.style.animationDelay = `${index * 0.1}s`;
            });
            isAdvancedModeAnimated = true;
        } else {
            console.log(`Animação já aplicada no ${dashboardId}, pulando...`);
            allCards.forEach(card => {
                card.style.animation = 'none';
            });
        }

        // Adiciona eventos de clique pras métricas
        dashboardDiv.querySelectorAll('.metric-clickable').forEach(metric => {
            metric.addEventListener('click', function () {
                this.classList.toggle('expanded');
            });
        });

        // Adiciona evento de copiar feedback
        dashboardDiv.querySelectorAll('.copy-feedback-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const feedbackText = btn.parentElement.querySelector('.section').innerText;
                navigator.clipboard.writeText(feedbackText).then(() => alert('Feedback copiado!'));
            });
        });
    }
});