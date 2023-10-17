const Inventario = require('../models/inventario');

const typeDefsInventario = `
    type Inventario {
        id: ID!
        nombre: String!
        categoria: String!
        detalle: String!
        cantidad: Int!
        disponibilidad: Boolean!
        image: String!
    }
    input InventarioInput{
        nombre: String
        categoria: String
        detalle: String
        cantidad: Int
        disponibilidad: Boolean
        image: String
    }
    type Alert{
        message: String
    }
    type Query{
        getInventario(page: Int, limit: Int = 1): [Inventario]
        getProducto(id: ID): Inventario
    }
    type Mutation{
        addProducto(input: InventarioInput): Inventario
        updProducto(id: ID, input: InventarioInput): Inventario
        delProducto(id: ID): Alert
    }
`;

const QueryInventario = {
	async getInventario(obj, { page, limit }) {
		const inventario = Inventario.find()
			.skip((page - 1) * limit)
			.limit(limit);
		return inventario;
	},
	async getProducto(obj, { id }) {
		const producto = await Inventario.findById(id);
		return producto;
	},
};
const MutationInventario = {
	async addProducto(obj, { input }) {
		const producto = new Inventario(input);
		producto.save();
		return producto;
	},
	async updProducto(obj, { id, input }) {
		const producto = await Inventario.findByIdAndUpdate(id, input);
		return producto;
	},
	async delProducto(obj, { id }) {
		await Inventario.deleteOne({ _id: id });
		return {
			message: `El producto ${id} fue eliminado`,
		};
	},
};
module.exports = { typeDefsInventario, QueryInventario, MutationInventario };
