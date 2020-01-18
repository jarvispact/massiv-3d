import uuid from '../utils/uuid';

const create = (world) => {
    const id = uuid();

    const getComponents = (type) => {
        const types = Array.isArray(type) ? type : [type];
        return world.componentsByEntityId[id].filter(c => types.includes(c.type));
    };

    const getComponent = (type) => getComponents(type)[0];

    return {
        id,
        getComponents,
        getComponent,
    };
};

const Entity = {
    create,
};

export default Entity;
