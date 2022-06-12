import * as THREE from 'three';


/* 
Faz a mudança na Geometria do retãngulo, ajustando os valores do objeto para ser mudado na scena.
*/
function mudaGeometria(retang, posicaoInicialX = 0, velocidadeAtual = 0, posicaoMinY = 0, posicaoMaxY = 0, color = 0x00FF00) {
    const verticesTriangulo = [];
    verticesTriangulo.push(posicaoInicialX, posicaoMinY - 2, 0.0);
    verticesTriangulo.push(velocidadeAtual, posicaoMinY - 2, 0.0);
    verticesTriangulo.push(velocidadeAtual, posicaoMaxY - 2, 0.0);

    verticesTriangulo.push(velocidadeAtual, posicaoMaxY - 2, 0.0);
    verticesTriangulo.push(posicaoInicialX, posicaoMaxY - 2, 0.0);
    verticesTriangulo.push(posicaoInicialX, posicaoMinY - 2, 0.0);

    retang.geometry.setAttribute('position', new THREE.Float32BufferAttribute(verticesTriangulo, 3))
    retang.material = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: false,
    })
}

/* 
Faz a criação do Retângulo básico como Objeto Gráfico, para ser colocado na cena.
*/
function criaRetangulo(color = 0x00FF00) {
    const verticesTriangulo = [];
    verticesTriangulo.push(0.0, 0.0, 0.0);
    verticesTriangulo.push(0.0, 0.0, 0.0);
    verticesTriangulo.push(0.0, 0.0, 0.0);

    verticesTriangulo.push(0.0, 0.0, 0.0);
    verticesTriangulo.push(0.0, 0.0, 0.0);
    verticesTriangulo.push(0.0, 0.0, 0.0);

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(verticesTriangulo, 3));

    const material = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: false
    });
    const retang = new THREE.Mesh(geometry, material);
    return retang;
}

export { criaRetangulo, mudaGeometria }