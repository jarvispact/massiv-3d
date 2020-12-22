import { vec3 } from 'gl-matrix';
import { toFloat } from '../utils/to-float';

const newMaterialRegex = /^newmtl\s(.*)$/;
const diffuseColorRegex = /^Kd\s(\S+)\s(\S+)\s(\S+)$/;
const specularColorRegex = /^Ks\s(\S+)\s(\S+)\s(\S+)$/;
const specularExponentRegex = /^Ns\s(\S+)$/;
const opacityRegex = /d\s(\S+)/;

export type ParsedMtlMaterial = {
    name: string;
    diffuseColor: vec3;
    specularColor: vec3;
    specularExponent: number;
    opacity: number;
};

export const parseMtlFile = (mtlFileContent: string): ParsedMtlMaterial[] => {
    const mtlDataLines = mtlFileContent.trim().split('\n');

    const materials: ParsedMtlMaterial[] = [];

    for (let lineIndex = 0; lineIndex < mtlDataLines.length; lineIndex++) {
        const line = mtlDataLines[lineIndex].trim();
        if (!line) continue;
        
        const materialMatch = line.match(newMaterialRegex);
        if (materialMatch) {
            const [, name] = materialMatch;
            materials.push({ name, diffuseColor: [1, 1, 1], specularColor: [1, 1, 1], specularExponent: 256, opacity: 1 });
        }

        const currentMaterial = materials[materials.length - 1];

        const diffuseColorMatch = line.match(diffuseColorRegex);
        if (diffuseColorMatch) {
            const [, r, g, b] = diffuseColorMatch;
            currentMaterial.diffuseColor = [toFloat(r), toFloat(g), toFloat(b)];
        }

        const specularColorMatch = line.match(specularColorRegex);
        if (specularColorMatch) {
            const [, r, g, b] = specularColorMatch;
            currentMaterial.specularColor = [toFloat(r), toFloat(g), toFloat(b)];
        }

        const specularExponentMatch = line.match(specularExponentRegex);
        if (specularExponentMatch) {
            const [, spec] = specularExponentMatch;
            currentMaterial.specularExponent = toFloat(spec);
        }

        const opacityMatch = line.match(opacityRegex);
        if (opacityMatch) {
            const [, opacity] = opacityMatch;
            currentMaterial.opacity = toFloat(opacity);
        }
    }

    return materials;
};
