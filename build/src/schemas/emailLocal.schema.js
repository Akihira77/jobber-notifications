"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderExtensionApprovalSchema = exports.orderExtensionSchema = exports.orderDeliveredSchema = exports.orderPlacedSchema = void 0;
const typebox_1 = require("@sinclair/typebox");
exports.orderPlacedSchema = typebox_1.Type.Object({
    orderId: typebox_1.Type.String(),
    invoiceId: typebox_1.Type.String(),
    buyerEmail: typebox_1.Type.String(),
    sellerEmail: typebox_1.Type.String(),
    orderDue: typebox_1.Type.String(),
    amount: typebox_1.Type.String(),
    buyerUsername: typebox_1.Type.String(),
    sellerUsername: typebox_1.Type.String(),
    title: typebox_1.Type.String(),
    description: typebox_1.Type.String(),
    requirements: typebox_1.Type.String(),
    serviceFee: typebox_1.Type.String(),
    total: typebox_1.Type.String(),
    orderUrl: typebox_1.Type.String()
});
exports.orderDeliveredSchema = typebox_1.Type.Object({
    orderId: typebox_1.Type.String(),
    buyerUsername: typebox_1.Type.String(),
    sellerUsername: typebox_1.Type.String(),
    title: typebox_1.Type.String(),
    description: typebox_1.Type.String(),
    orderUrl: typebox_1.Type.String(),
    receiverEmail: typebox_1.Type.String()
});
exports.orderExtensionSchema = typebox_1.Type.Object({
    orderId: typebox_1.Type.String(),
    buyerUsername: typebox_1.Type.String(),
    sellerUsername: typebox_1.Type.String(),
    originalDate: typebox_1.Type.String(),
    newDate: typebox_1.Type.String(),
    reason: typebox_1.Type.String(),
    orderUrl: typebox_1.Type.String(),
    receiverEmail: typebox_1.Type.String()
});
exports.orderExtensionApprovalSchema = typebox_1.Type.Object({
    subject: typebox_1.Type.String(),
    buyerUsername: typebox_1.Type.String(),
    sellerUsername: typebox_1.Type.String(),
    type: typebox_1.Type.String(),
    message: typebox_1.Type.String(),
    header: typebox_1.Type.String(),
    orderUrl: typebox_1.Type.String(),
    receiverEmail: typebox_1.Type.String()
});
//# sourceMappingURL=emailLocal.schema.js.map