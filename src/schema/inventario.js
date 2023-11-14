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
    type InventarioPag {
        productos: [Inventario]
        totalProductos: Int
    }
    type Query{
        getInventario(page: Int, limit: Int = 1, search: String, tipoFilter: [String], estadoFilter: [String], cantidadFilter: [String]): InventarioPag
        getProducto(id: ID): Inventario
    }
    type Mutation{
        addProducto(input: InventarioInput): Inventario
        updProducto(id: ID, input: InventarioInput): Inventario
        delProducto(id: ID): Alert
    }
`;

const QueryInventario = {
	async getInventario(obj, { page, limit, search, tipoFilter, estadoFilter, cantidadFilter }) {
		let findQuery = { nombre: { $regex: search } };

		if (tipoFilter.length > 0) {
			findQuery = { ...findQuery, categoria: { $in: tipoFilter } };
		}

		// si no hay ningun filtro de estado o se seleccionan los dos simplemente retornar todo
		if (estadoFilter.length !== 0 && estadoFilter.length !== 2) {
			if (estadoFilter.includes('disponible')) {
				findQuery = { ...findQuery, disponibilidad: true };
			}
			if (estadoFilter.includes('no_disponible')) {
				findQuery = { ...findQuery, disponibilidad: false };
			}
		}

		const cantidadProductoAceptable = 3;

		if (cantidadFilter.length !== 0 && cantidadFilter.length !== 2) {
			if (cantidadFilter.includes('cantidad_baja')) {
				findQuery = { ...findQuery, cantidad: { $lt: cantidadProductoAceptable } };
			}
			if (cantidadFilter.includes('cantidad_alta')) {
				findQuery = { ...findQuery, cantidad: { $gte: cantidadProductoAceptable } };
			}
		}

		const [productos, totalProductos] = await Promise.all([
			Inventario.find(findQuery)
				.skip((page - 1) * limit)
				.limit(limit),
			Inventario.countDocuments(findQuery),
		]);
		return {
			productos,
			totalProductos,
		};
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
