const Ticket = require('../models/ticket');
const TicketEspecial = require('../models/ticketEspecial');
const Inventario = require('../models/inventario');

const typeDefsTicket = `
    scalar Date

    type Ticket {
        id: ID!
        producto: Inventario!
        ticketEspecial: TicketEspecial
        estadoPrestamo: String!
        rut: String!
        estadoTicket: String!
        fechaPrestamo: Date!
    }
    input TicketInput {
        producto: ID
        fechaTermino: Date
        estadoPrestamo: String
        rut: String
        estadoTicket: String
    }
    type TicketEspecial {
        id: ID!
        fechaTermino: Date!
    }
    input TicketEspecialInput {
        fechaTermino: Date!
    }
    type TicketPag {
        tickets: [Ticket]
        totalTickets: Int
    }
    type Query {
        getTickets(page: Int, limit: Int = 1, ticketFilter: [String], rutUsuario: String) : TicketPag
        getTicket(id: ID) : Ticket
		getAllTickets: [Ticket]
    }
    type Mutation {
        addTicket(input: TicketInput) : Ticket
        updTicket(id: ID, input: TicketInput) : Ticket
    }
`;

/*
<option value='esperando'>Esperando entrega</option>
<option value='entregado'>Entregado al usuario</option>
<option value='devuelto'>Producto devuelto</option>
*/

const HandleCantidadChange = (prevState, currentState) => {
	if (prevState === currentState) return 0;

	if (currentState === 'esperando') {
		if (prevState === 'entregado') {
			return 1;
		}
		return 0;
	}

	if (currentState === 'entregado') {
		return -1;
	}

	if (currentState === 'devuelto') {
		if (prevState === 'entregado') {
			return 1;
		}
		return 0;
	}
};

const QueryTicket = {
	async getTickets(obj, { page, limit, ticketFilter, rutUsuario }) {
		let findQuery = {};

		if (ticketFilter.length !== 0 && ticketFilter.length !== 2) {
			if (ticketFilter.includes('prestamo')) {
				findQuery = { ...findQuery, estadoPrestamo: { $ne: 'devuelto' } };
			}
			if (ticketFilter.includes('devolucion')) {
				findQuery = { ...findQuery, estadoPrestamo: 'devuelto' };
			}
		}

		// para que los usuarios con bajos privilegios solo vean sus tickets
		if (rutUsuario !== '') {
			findQuery = { ...findQuery, rut: rutUsuario };
		}

		const [tickets, totalTickets] = await Promise.all([
			Ticket.find(findQuery)
				.populate('producto')
				.populate('ticketEspecial')
				.skip((page - 1) * limit)
				.limit(limit),
			Ticket.countDocuments(findQuery),
		]);
		return { tickets, totalTickets };
	},
	async getTicket(obj, { id }) {
		const ticket = await Ticket.findById(id).populate('producto').populate('ticketEspecial');
		return ticket;
	},
	getAllTickets: async () => {
		try {
			const tickets = await Ticket.find().populate('producto').populate('ticketEspecial');
			return tickets;
		} catch (error) {
			throw new Error(error.message);
		}
	},
};

const MutationTicket = {
	async addTicket(obj, { input }) {
		let ticketObj = { ...input, fechaPrestamo: new Date() };
		if (input.fechaTermino !== undefined) {
			const ticketEspecial = new TicketEspecial({ fechaTermino: new Date(input.fechaTermino) });
			await ticketEspecial.save();
			ticketObj = { ...ticketObj, ticketEspecial: ticketEspecial._id };
		}

		const ticket = new Ticket(ticketObj);

		await Promise.all([
			Inventario.findByIdAndUpdate(input.producto, {
				$inc: { cantidad: HandleCantidadChange('', input.estadoPrestamo) },
			}),
			ticket.save(),
		]);

		return ticket;
	},
	async updTicket(obj, { id, input }) {
		const ticketDB = await Ticket.findById(id);

		if (input.fechaTermino !== undefined) {
			await TicketEspecial.findByIdAndUpdate(ticketDB.ticketEspecial, {
				fechaTermino: input.fechaTermino,
			});
		}

		// eslint-disable-next-line no-unused-vars
		const [_, ticket] = await Promise.all([
			Inventario.findByIdAndUpdate(input.producto, {
				$inc: { cantidad: HandleCantidadChange(ticketDB.estadoPrestamo, input.estadoPrestamo) },
			}),
			Ticket.findByIdAndUpdate(id, input),
		]);

		return ticket;
	},
};

module.exports = { typeDefsTicket, QueryTicket, MutationTicket };
