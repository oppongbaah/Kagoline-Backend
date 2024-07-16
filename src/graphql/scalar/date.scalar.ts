import { GraphQLScalarType, Kind } from "graphql";
import { graphqlConstants } from "../../utils/constants/graphql.const";

const dateScalarType = new GraphQLScalarType({
	name: graphqlConstants.scalar.date.name,
	description: graphqlConstants.scalar.date.description,
	serialize(value: Date) {
		// Convert outgoing Date to integer for JSON
		return value.getTime();
	},
	parseValue(value: Date) {
		// Convert incoming integer to Date
		return new Date(value);
	},
	parseLiteral(ast) {
		// Convert hard-coded AST string to integer and then to Date
		if (ast.kind === Kind.INT) {
			return new Date(parseInt(ast.value, 10));
		}
		// Invalid hard-coded value (not an integer)
		return null;
	},
});

export { dateScalarType };
