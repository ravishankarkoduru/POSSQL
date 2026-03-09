class TransactionModel {
  final String id;
  final String itemName;
  final int quantity;
  final double price;
  final double total;
  final DateTime timestamp;
  final String userId;
  final bool synced;

  TransactionModel({
    required this.id,
    required this.itemName,
    required this.quantity,
    required this.price,
    required this.total,
    required this.timestamp,
    required this.userId,
    this.synced = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'item_name': itemName,
      'quantity': quantity,
      'price': price,
      'total': total,
      'timestamp': timestamp.toIso8601String(),
      'user_id': userId,
      'synced': synced ? 1 : 0,
    };
  }

  factory TransactionModel.fromMap(Map<String, dynamic> map) {
    return TransactionModel(
      id: map['id'],
      itemName: map['item_name'],
      quantity: map['quantity'],
      price: map['price'],
      total: map['total'],
      timestamp: DateTime.parse(map['timestamp']),
      userId: map['user_id'],
      synced: map['synced'] == 1,
    );
  }
}
