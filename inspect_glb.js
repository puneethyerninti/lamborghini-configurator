const fs = require('fs');

function inspectGLB(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    
    // GLB starts with magic number 'glTF' (0x46546C67)
    const magic = buffer.readUInt32LE(0);
    if (magic !== 0x46546c67) {
      console.log('Not a valid GLB file');
      return;
    }
    
    // Version and length
    const version = buffer.readUInt32LE(4);
    const length = buffer.readUInt32LE(8);
    
    // Chunk 0 (JSON)
    const chunk0Length = buffer.readUInt32LE(12);
    const chunk0Type = buffer.readUInt32LE(16);
    
    if (chunk0Type !== 0x4E4F534A) { // 'JSON'
      console.log('First chunk is not JSON');
      return;
    }
    
    const jsonBuffer = buffer.slice(20, 20 + chunk0Length);
    const jsonStr = jsonBuffer.toString('utf8');
    const gltf = JSON.parse(jsonStr);
    
    console.log('=== GLTF Structure ===');
    
    console.log('\n--- Materials ---');
    if (gltf.materials) {
      gltf.materials.forEach((mat, i) => {
        console.log(`[${i}] ${mat.name}`);
      });
    } else {
      console.log('No materials found');
    }
    
    console.log('\n--- Meshes ---');
    if (gltf.meshes) {
      gltf.meshes.forEach((mesh, i) => {
        console.log(`[${i}] ${mesh.name}`);
        if (mesh.primitives) {
           mesh.primitives.forEach(p => {
              if (p.material !== undefined) {
                  console.log(`   -> uses material [${p.material}] ${gltf.materials[p.material].name}`);
              }
           });
        }
      });
    }
    
  } catch (err) {
    console.error('Error reading GLB:', err);
  }
}

inspectGLB('./public/lamborghini_light.glb');
