class FormulaBody extends React.Component {

    state = {
        formulaKey: "table",
        detailsKey: "details"
    };

    _addIngredient() {
        PN.activeFormula.ingredients.push({id: "", quantity: 0.0});
        PN.recomputeFormula();
        this.forceUpdate();
    }

    _deleteIngredient(index) {
        PN.activeFormula.ingredients.splice(index, 1);
        PN.recomputeFormula();
        this.setState({tableKey: PN.guid()});
    }

    _changeDilution(id) {
        PN.activeFormula.dilutant = id;
        PN.recomputeFormula();
        this.setState({detailsKey: PN.guid()});
    }

    _changeDilutionQuantity(value) {
        PN.activeFormula.dilutantQuantity = Math.max(parseFloat(value), 0.0);
        PN.recomputeFormula();
        this.setState({detailsKey: PN.guid()});
    }

    _changeIngredient(id, ingredient) {
        ingredient.id = id;
        PN.recomputeFormula();
        this.setState({detailsKey: PN.guid()});
    }

    _changeQuantity(value, ingredient) {
        ingredient.quantity = Math.max(parseFloat(value), 0.0);
        PN.recomputeFormula();
        this.setState({detailsKey: PN.guid()});
    }

    _renderPercentInProduct(id, material) {
        const floatValue = (PN.activeFormula.computed[id].percentInProduct || 0).toPrecision(6);
        if (material.max_in_finished_product && floatValue > material.max_in_finished_product) {
            return (
                <span className="error">{floatValue}</span>
            );
        } 
        return floatValue;
    }

    _getTooltip(id) {
        const material = PN.getMaterial(id);
        const mix = PN.getMixture(id);
        let tooltip = "";
        if (material != null) {
            tooltip = material.scent + "\n\n" + material.usage;
        } else if (mix != null) {
            const materials = PN.getMaterialsFromMixture(mix);
            for (let material of materials) {
                tooltip = tooltip + material.scent + "\n\n" + material.usage + "\n\n-----\n\n";
            }
        }
        return tooltip;
    }

    _renderDetailsRows() {
        const elements = [];
        for (let id in PN.activeFormula.computed) {
            const material = PN.getMaterial(id);
            elements.push(
                <tr key={'detail' + id}>
                    <td><div data-tooltip={this._getTooltip(material.id)}>{material.name || "???"}</div></td>
                    <td>{(PN.activeFormula.computed[id].quantity || 0).toPrecision(4)}</td>
                    <td>{(PN.activeFormula.computed[id].percent || 0).toPrecision(6)}</td>
                    <td>{material.avg_use_in_concentrate || ""}</td>
                    <td>{material.max_use_in_concentrate || ""}</td>
                    <td>{this._renderPercentInProduct(id, material)}</td>
                    <td>{material.max_in_finished_product || ""}</td>
                </tr>
            );
        }
        return elements;
    }

    render() {

        const elements = [];
        for (let index in PN.activeFormula.ingredients || []) {
            const ingredient = PN.activeFormula.ingredients[index]
            elements.push(
                <tr key={"ingredient" + index + this.state.tableKey}>
                    <td>
                        <IngredientPicker defaultValue={ingredient.id}
                                          id={"ingredient" + index}
                                          onChange={(id) => this._changeIngredient(id, ingredient)}/>
                    </td>
                    <td>
                        <input type="number" 
                               step="0.001" 
                               min="0"
                               defaultValue={ingredient.quantity || 0.0} 
                               onChange={(event) => this._changeQuantity(event.target.value, ingredient)}/>
                    </td>
                    <td>
                        <button type="button" 
                                onClick={() => this._deleteIngredient(index)}>
                            Delete
                        </button>
                    </td>
                </tr>
            );
        }

        return (
            <div>
                <div className="tabletext">
                    INGREDIENT LIST
                </div>
                <table className="ingredienttable">
                    <tbody>
                        <tr>
                            <th>DILUTANT</th>
                            <th>WEIGHT (GRAMS)</th>
                        </tr>
                        <tr>
                            <td>
                                <IngredientPicker defaultValue={PN.activeFormula.dilutant}
                                                    id={"dilutant"}
                                                    allowSolvents={true}
                                                    allowMixtures={false}
                                                    allowMaterials={false}
                                                    onChange={(id) => this._changeDilution(id)}/>
                            </td>
                            <td>
                                <input type="number" 
                                    step="0.001" 
                                    min="0"
                                    defaultValue={PN.activeFormula.dilutantQuantity} 
                                    onChange={(event) => this._changeDilutionQuantity(event.target.value)}/>
                            </td>
                        </tr>
                        <tr>
                            <th>INGREDIENT</th>
                            <th></th>
                        </tr>
                        {elements}
                        <tr>
                            <td colSpan="3">
                                <button type="button" 
                                        onClick={() => this._addIngredient()}>
                                    New Ingredient
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="tabletext">
                    MATERIAL MANIFEST
                </div>
                <table className="formulatable" key={this.state.detailsKey}>
                    <tbody>
                        <tr>
                            <th>MATERIAL</th>
                            <th>WEIGHT (GRAMS)</th>
                            <th>% IN CONCENTRATE</th>
                            <th>AVG % ADVISED IN CONCENTRATE</th>
                            <th>MAX % ADVISED IN CONCENTRATE</th>
                            <th>% IN FINISHED PRODUCT</th>
                            <th>MAX % IN FINISHED PRODUCT (IFRA)</th>
                        </tr>
                        {this._renderDetailsRows()}
                    </tbody>
                </table>
            </div>
        );
    }
}