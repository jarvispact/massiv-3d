import { Component } from './component';

const hasMoreThanOneComponentsOfSameType = (componentTypes: string[]) => [...new Set(componentTypes)].length < componentTypes.length;

export const createEntity = <Name extends string, Comp extends Component>(name: Name, _components: Array<Comp>) => {
    type ComponentMap = Record<string, Comp | undefined>;

    const components: ComponentMap = _components.reduce((accum, comp) => {
        accum[comp.type] = comp;
        return accum;
    }, {} as ComponentMap);

    let componentTypes = _components.map(c => c.type);

    if (hasMoreThanOneComponentsOfSameType(componentTypes)) {
        throw new Error('a entity can only one component of any type');
    }

    const addComponent = <C extends Comp>(component: C) => {
        components[component.type] = component;
        componentTypes.push(component.type);

        if (hasMoreThanOneComponentsOfSameType(componentTypes)) {
            throw new Error('a entity can only one component of any type');
        }
    };

    const removeComponent = <T extends string>(type: Comp['type'] | T) => {
        components[type] = undefined;
        componentTypes = componentTypes.filter(t => t !== type);
    };

    const getComponent = <T extends string>(type: Comp['type'] | T) => components[type];
    const getComponentTypes = () => componentTypes;

    return {
        name,
        addComponent,
        removeComponent,
        getComponent,
        getComponentTypes,
    };
};

export type Entity = ReturnType<typeof createEntity>;