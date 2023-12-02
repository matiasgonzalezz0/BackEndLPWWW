const Ticket = require('../models/ticket');
const TicketEspecial = require('../models/ticketEspecial');

const typeDefsTicket = `
    scalar Date

    type Ticket {
        id: ID!
        producto: Inventario!
        ticketEspecial: TicketEspecial
        estadoPrestamo: String!
        rut: Int!
        estadoTicket: String!
        fechaPrestamo: Date!
    }
    input TicketInput {
        producto: String
        ticketEspecial: String
        fechaTermino: Date
        estadoPrestamo: String
        rut: Int
        estadoTicket: String
    }
    type TicketEspecial {
        id: ID!
        fechaTermino: Date!
    }
    input TicketEspecialInput {
        fechaTermino: Date!
    }
    type Query {
        getTickets(page: Int, limit: Int = 1) : [Ticket]
        getTicket(id: ID) : Ticket
    }
    type Mutation {
        addTicket(input: TicketInput) : Ticket
        updTicket(id: ID, input: TicketInput) : Ticket
    }
`;

const QueryTicket = {
	async getTickets(obj, { page, limit, tipoFilter }) {
        const findQuery = {};
        if (tipoFilter !== undefined) {
            findQuery.estadoPrestamo = tipoFilter;
        }
		const tickets = await Ticket.find(findQuery)
			.populate('producto')
			.populate('ticketEspecial')
			.skip((page - 1) * limit)
			.limit(limit);
		return tickets;
	},
	async getTicket(obj, { id }) {
		const ticket = await Ticket.findById(id).populate('producto').populate('ticketEspecial');
		return ticket;
	},
};

const MutationTicket = {
	async addTicket(obj, { input }) {
		let ticketObj = { ...input, fechaPrestamo: new Date() };
		if (input.fechaTermino !== undefined) {
			const ticketEspecial = new TicketEspecial({ fechaTermino: new Date() });
			await ticketEspecial.save();
			ticketObj = { ...ticketObj, ticketEspecial: ticketEspecial._id };
		}
		const ticket = new Ticket(ticketObj);

		await ticket.save();

		return ticket;
	},
	async updTicket(obj, { id, input }) {
		if (input.fechaTermino !== undefined) {
			const ticketDB = await Ticket.findById(id);

			await TicketEspecial.findByIdAndUpdate(ticketDB.ticketEspecial, {
				fechaTermino: input.fechaTermino,
			});
		}

		const ticket = await Ticket.findByIdAndUpdate(id, input);
		return ticket;
	},
};

module.exports = { typeDefsTicket, QueryTicket, MutationTicket };
