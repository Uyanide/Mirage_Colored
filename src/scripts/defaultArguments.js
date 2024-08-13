import defaultArgumentsConfig from './defaultArgumentsConfig.json';

const getArguments = () => {
    return defaultArgumentsConfig;
}

document.addEventListener('DOMContentLoaded', () => {
    const list = [
        { id: "maxSizeInput", value: defaultArgumentsConfig.max_size },
        { id: "innerScaleRange", value: defaultArgumentsConfig.scale_i },
        { id: "innerScaleInput", value: defaultArgumentsConfig.scale_i },
        { id: "coverScaleRange", value: defaultArgumentsConfig.scale_c },
        { id: "coverScaleInput", value: defaultArgumentsConfig.scale_c },
        { id: "innerWeightRange", value: defaultArgumentsConfig.weight_i },
        { id: "innerWeightInput", value: defaultArgumentsConfig.weight_i },
    ]
    document.getElementById('isColoredCheckbox').checked = defaultArgumentsConfig.is_colored;
    list.forEach((item) => {
        document.getElementById(item.id).value = item.value;
    });
});

export { getArguments };