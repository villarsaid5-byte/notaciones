```javascript
function esOperador(c) {
    return c === '+' ||
           c === '-' ||
           c === '*' ||
           c === '/' ||
           c === '^';
}

function prioridad(c) {

    if (c === '^') {
        return 3;
    }

    if (c === '*' || c === '/') {
        return 2;
    }

    if (c === '+' || c === '-') {
        return 1;
    }

    return 0;
}


// INFija → POSFIJA
function infijaAPosfija(expresion) {

    let pila = [];
    let salida = [];

    for (let caracter of expresion) {

        // Ignorar espacios
        if (caracter === ' ') {
            continue;
        }

        // Letras y números
        if (/[a-zA-Z0-9]/.test(caracter)) {
            salida.push(caracter);
        }

        // Paréntesis izquierdo
        else if (caracter === '(') {
            pila.push(caracter);
        }

        // Paréntesis derecho
        else if (caracter === ')') {

            while (
                pila.length > 0 &&
                pila[pila.length - 1] !== '('
            ) {
                salida.push(pila.pop());
            }

            if (pila.length === 0) {
                throw new Error("Paréntesis incorrectos");
            }

            pila.pop();
        }

        // Operadores
        else if (esOperador(caracter)) {

            while (
                pila.length > 0 &&
                pila[pila.length - 1] !== '(' &&
                prioridad(pila[pila.length - 1]) >= prioridad(caracter)
            ) {
                salida.push(pila.pop());
            }

            pila.push(caracter);
        }

        // Carácter no válido
        else {
            throw new Error(
                "Carácter no válido: " + caracter
            );
        }
    }

    // Vaciar la pila
    while (pila.length > 0) {

        if (pila[pila.length - 1] === '(') {
            throw new Error("Paréntesis incorrectos");
        }

        salida.push(pila.pop());
    }

    return salida.join('');
}


// INFIJA → PREFIJA
function infijaAPrefija(expresion) {

    // Eliminar espacios y convertir en arreglo
    let caracteres = expresion
        .replace(/\s/g, '')
        .split('');

    // Invertir la expresión
    caracteres.reverse();

    // Cambiar los paréntesis
    for (let i = 0; i < caracteres.length; i++) {

        if (caracteres[i] === '(') {
            caracteres[i] = ')';
        }

        else if (caracteres[i] === ')') {
            caracteres[i] = '(';
        }
    }

    let invertida = caracteres.join('');

    // Convertir a posfija
    let posfija = infijaAPosfija(invertida);

    // Invertir el resultado
    return posfija
        .split('')
        .reverse()
        .join('');
}


// FUNCIÓN PRINCIPAL
function convertir() {

    let expresion =
        document.getElementById("expresion").value.trim();

    let error =
        document.getElementById("error");

    // Limpiar mensaje de error
    error.textContent = "";

    // Verificar que exista una expresión
    if (expresion === "") {

        error.textContent =
            "Escribe una expresión.";

        return;
    }

    try {

        // Convertir a posfija
        let posfija =
            infijaAPosfija(expresion);

        // Convertir a prefija
        let prefija =
            infijaAPrefija(expresion);

        // Mostrar expresión infija
        document.getElementById("infija").textContent =
            expresion.replace(/\s/g, '');

        // Mostrar expresión prefija
        document.getElementById("prefija").textContent =
            prefija;

        // Mostrar expresión posfija
        document.getElementById("posfija").textContent =
            posfija;

    } catch (e) {

        // Mostrar error
        error.textContent =
            "Error: " + e.message;
    }
}
```
