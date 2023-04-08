function novoElemento(tagName, className) {
    const elem = document.createElement(tagName);
    elem.classList.add(className);
    return elem;
}

class Barreira {
    constructor(reversa = false) {
        this.elemento = novoElemento("div", "barreira");

        const borda = novoElemento("div", "borda");
        const corpo = novoElemento("div", "corpo");
        this.elemento.appendChild(reversa ? corpo : borda);
        this.elemento.appendChild(reversa ? borda : corpo);

        this.setAltura = (altura) => (corpo.style.height = `${altura}px`);
    }
}

/* const b = new Barreira(true);
b.setAltura(400);
const jogo = document.querySelector("[wm-flappy]");
jogo.appendChild(b.elemento); */

class parBarreiras {
    constructor(altura, abertura, x) {
        this.elemento = novoElemento("div", "par-de-barreiras");

        this.superior = new Barreira(true);
        this.inferior = new Barreira();

        this.elemento.appendChild(this.superior.elemento);
        this.elemento.appendChild(this.inferior.elemento);

        this.sortHeight = () => {
            const alturaSup = Math.random() * (altura - abertura);
            const alturaInf = altura - abertura - alturaSup;
            this.superior.setAltura(alturaSup);
            this.inferior.setAltura(alturaInf);
        };

        this.getX = () => parseInt(this.elemento.style.left.split("px")[0]);
        this.setX = (X) => (this.elemento.style.left = `${X}px`);
        this.getLargura = () => this.elemento.clientWidth;

        this.sortHeight();
        this.setX(x);
    }
}

/* const b = new parBarreiras(700, 300, 400);
const jogo = document.querySelector("[wm-flappy]");
jogo.appendChild(b.elemento); */

class Barreiras {
    constructor(altura, largura, abertura, espaço, notificarPonto) {
        this.pares = [
            new parBarreiras(altura, abertura, largura),
            new parBarreiras(altura, abertura, largura + espaço),
            new parBarreiras(altura, abertura, largura + espaço * 2),
            new parBarreiras(altura, abertura, largura + espaço * 3),
        ];

        const deslocamento = 3;
        this.animar = () => {
            this.pares.forEach((e) => {
                e.setX(e.getX() - deslocamento);

                if (e.getX() < -e.getLargura()) {
                    e.setX(e.getX() + espaço * this.pares.length);
                    e.sortHeight();
                }

                const meio = largura / 2;
                const cruzouOMeio = e.getX() + deslocamento >= meio && e.getX() < meio;

                if (cruzouOMeio) notificarPonto();
            });
        };
    }
}

class Passaro {
    constructor(alturaJogo) {
        let voando = false;

        window.onkeydown = (e) => {
            console.log("apertou");
            voando = true;
        };
        window.onkeyup = (e) => (voando = false);

        this.elemento = novoElemento("img", "passaro");
        this.elemento.src = "imgs/passaro.png";

        this.getY = () => parseInt(this.elemento.style.bottom.split("px")[0]);
        this.setY = (y) => (this.elemento.style.bottom = `${y}px`);

        this.animar = () => {
            const novoY = this.getY() + (voando ? 8 : -5);

            const alturaMax = alturaJogo - this.elemento.clientHeight;

            if (novoY >= alturaMax) {
                this.setY(alturaMax);
            } else if (novoY < 0) {
                this.setY(0);
            } else {
                this.setY(novoY);
            }
        };

        this.setY(alturaJogo / 2);
    }
}

class Progresso {
    constructor() {
        this.elemento = novoElemento("span", "score");
        this.atualizarPontos = (pontos) => {
            this.elemento.innerHTML = pontos;
        };

        this.atualizarPontos(0);
    }
}

function estaoSobrepostos(elemntoA, elementoB) {
    const a = elemntoA.getBoundingClientRect();
    const b = elementoB.getBoundingClientRect();

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;

    return horizontal && vertical;
}

function colidiu(passaro, barreiras) {
    let colidiu = false;
    barreiras.pares.forEach((par) => {
        if (!colidiu) {
            const superior = par.superior.elemento;
            const inferior = par.inferior.elemento;

            colidiu =
                estaoSobrepostos(passaro.elemento, superior) ||
                estaoSobrepostos(passaro.elemento, inferior);
        }
    });

    return colidiu;
}

class FlappyBird {
    constructor() {
        let pontos = 0;
        const areaDoJogo = document.querySelector("[wm-flappy]");
        const altura = areaDoJogo.clientHeight;
        const largura = areaDoJogo.clientWidth;

        const progresso = new Progresso();
        const barreiras = new Barreiras(altura, largura, 300, 400, () =>
            progresso.atualizarPontos(++pontos)
        );
        const passaro = new Passaro(altura);

        areaDoJogo.appendChild(progresso.elemento);
        areaDoJogo.appendChild(passaro.elemento);
        barreiras.pares.forEach((e) => areaDoJogo.appendChild(e.elemento));

        this.start = () => {
            const temp = setInterval(() => {
                barreiras.animar();
                passaro.animar();

                if (colidiu(passaro, barreiras)) {
                    clearInterval(temp);
                }
            }, 20);
        };
    }
}

new FlappyBird().start();
