import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';
import '../models/transaction_model.dart';
import '../providers/transaction_provider.dart';

class NoodleItem {
  final String id;
  final String name;
  final double price;
  final String category;
  final String imageUrl;
  final int stock;
  final bool isExpired;

  NoodleItem({
    required this.id,
    required this.name,
    required this.price,
    required this.category,
    required this.imageUrl,
    this.stock = 0,
    this.isExpired = false,
  });
}

final List<NoodleItem> noodleItems = [
  NoodleItem(id: 'n1', name: 'Batchoy', price: 60.00, category: 'Noodles', imageUrl: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?q=80&w=200&h=200&auto=format&fit=crop', stock: 97, isExpired: true),
  NoodleItem(id: 'n2', name: 'C2', price: 20.00, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1544145945-f904253d0c7b?q=80&w=200&h=200&auto=format&fit=crop', stock: 44, isExpired: false),
  NoodleItem(id: 'n3', name: 'Cheese', price: 10.00, category: 'Add-ons', imageUrl: 'https://images.unsplash.com/photo-1528283753224-3a248ad889af?q=80&w=200&h=200&auto=format&fit=crop', stock: 12, isExpired: false),
  NoodleItem(id: 'n4', name: 'CHEESE ramen', price: 130.00, category: 'Ramen', imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=200&h=200&auto=format&fit=crop', stock: 9, isExpired: true),
  NoodleItem(id: 'n5', name: 'Stir-Fry', price: 85.00, category: 'Noodles', imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=200&h=200&auto=format&fit=crop', stock: 25, isExpired: false),
  NoodleItem(id: 'n6', name: 'Hotdog', price: 35.00, category: 'Add-ons', imageUrl: 'https://images.unsplash.com/photo-1541214113241-21578d2d9b62?q=80&w=200&h=200&auto=format&fit=crop', stock: 18, isExpired: false),
];

class NoodlePosScreen extends StatefulWidget {
  const NoodlePosScreen({super.key});

  @override
  State<NoodlePosScreen> createState() => _NoodlePosScreenState();
}

class _NoodlePosScreenState extends State<NoodlePosScreen> {
  final Map<String, int> _cart = {};

  double get _total {
    double total = 0;
    _cart.forEach((id, qty) {
      final item = noodleItems.firstWhere((i) => i.id == id);
      total += item.price * qty;
    });
    return total;
  }

  void _addToCart(String id) {
    setState(() {
      _cart[id] = (_cart[id] ?? 0) + 1;
    });
  }

  void _removeFromCart(String id) {
    setState(() {
      if (_cart.containsKey(id)) {
        if (_cart[id]! > 1) {
          _cart[id] = _cart[id]! - 1;
        } else {
          _cart.remove(id);
        }
      }
    });
  }

  void _showCart() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1E293B),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text("Current Order", style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                      IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close, color: Colors.slate)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (_cart.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 40),
                      child: Text("Cart is empty", style: TextStyle(color: Colors.slate)),
                    )
                  else
                    Flexible(
                      child: ListView(
                        shrinkWrap: true,
                        children: _cart.entries.map((entry) {
                          final item = noodleItems.firstWhere((i) => i.id == entry.key);
                          return ListTile(
                            contentPadding: EdgeInsets.zero,
                            title: Text(item.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                            subtitle: Text("₱${(item.price * entry.value).toStringAsFixed(2)}", style: const TextStyle(color: Color(0xFF4ADE80))),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  onPressed: () {
                                    _removeFromCart(item.id);
                                    setModalState(() {});
                                    setState(() {});
                                  },
                                  icon: const Icon(Icons.remove_circle_outline, color: Colors.slate),
                                ),
                                Text("${entry.value}", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                IconButton(
                                  onPressed: () {
                                    _addToCart(item.id);
                                    setModalState(() {});
                                    setState(() {});
                                  },
                                  icon: const Icon(Icons.add_circle_outline, color: Colors.slate),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  const Divider(color: Color(0xFF334155), height: 32),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text("Total", style: TextStyle(color: Colors.slate, fontSize: 16)),
                      Text("₱${_total.toStringAsFixed(2)}", style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _cart.isEmpty ? null : () {
                        _checkout();
                        Navigator.pop(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF4ADE80),
                        foregroundColor: const Color(0xFF0F172A),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: const Text("Checkout Now", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            );
          }
        );
      },
    );
  }

  Future<void> _checkout() async {
    if (_cart.isEmpty) return;

    final provider = Provider.of<TransactionProvider>(context, listen: false);
    
    for (var entry in _cart.entries) {
      final item = noodleItems.firstWhere((i) => i.id == entry.key);
      final t = TransactionModel(
        id: const Uuid().v4(),
        itemName: item.name,
        quantity: entry.value,
        price: item.price,
        total: item.price * entry.value,
        timestamp: DateTime.now(),
        userId: "1",
      );
      await provider.addTransaction(t);
    }

    setState(() {
      _cart.clear();
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Checkout successful!")),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Korean Ramen", style: TextStyle(color: Color(0xFF4ADE80), fontWeight: FontWeight.w900, fontSize: 20)),
            Text("Point of Sale", style: TextStyle(color: Colors.slate[500], fontSize: 12)),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
            child: InkWell(
              onTap: () => _showCart(),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFF312E81).withOpacity(0.4),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.3)),
                ),
                child: Center(
                  child: Text(
                    "${_cart.values.fold(0, (a, b) => a + b)}x ₱${_total.toStringAsFixed(2)}",
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search & Filter Bar
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B).withOpacity(0.5),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF334155).withOpacity(0.5)),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: "All items",
                        dropdownColor: const Color(0xFF1E293B),
                        style: const TextStyle(color: Colors.white),
                        items: ["All items", "Ramen", "Drinks", "Add-ons"].map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                        onChanged: (_) {},
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                _buildIconBtn(Icons.qr_code_scanner),
                const SizedBox(width: 12),
                _buildIconBtn(Icons.search),
              ],
            ),
          ),
          // Items Grid
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.75,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
              ),
              itemCount: noodleItems.length,
              itemBuilder: (context, index) {
                final item = noodleItems[index];
                return GestureDetector(
                  onTap: () => _addToCart(item.id),
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFF334155).withOpacity(0.5)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ClipRRect(
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                          child: AspectRatio(
                            aspectRatio: 4/3,
                            child: Image.network(
                              item.imageUrl,
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(12.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16), maxLines: 1, overflow: TextOverflow.ellipsis),
                              const SizedBox(height: 8),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text("₱${item.price.toStringAsFixed(2)}", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                                  Row(
                                    children: [
                                      if (item.isExpired) const Text("EXPIRED ", style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 10)),
                                      Text("${item.stock}", style: const TextStyle(color: Color(0xFF4ADE80), fontWeight: FontWeight.bold, fontSize: 16)),
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIconBtn(IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B).withOpacity(0.5),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF334155).withOpacity(0.5)),
      ),
      child: Icon(icon, color: Colors.slate[300]),
    );
  }
}
