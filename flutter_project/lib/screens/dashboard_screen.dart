import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/transaction_provider.dart';
import 'add_transaction_screen.dart';
import 'history_screen.dart';
import 'noodle_pos_screen.dart';
import 'login_screen.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<TransactionProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B).withOpacity(0.5),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.menu, color: Colors.white),
            ),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        title: const Text(
          "Dashboard",
          style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B).withOpacity(0.5),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF334155).withOpacity(0.5)),
            ),
            child: const Row(
              children: [
                Icon(Icons.calendar_today, color: Colors.indigoAccent, size: 16),
                SizedBox(width: 8),
                Text(
                  "09/03/2026 - 09/03/2026",
                  style: TextStyle(color: Colors.slate300, fontSize: 12, fontWeight: FontWeight.bold),
                ),
                SizedBox(width: 4),
                Icon(Icons.keyboard_arrow_down, color: Colors.slate500, size: 16),
              ],
            ),
          ),
        ],
      ),
      drawer: Drawer(
        backgroundColor: const Color(0xFF0F172A),
        child: Column(
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(color: Color(0xFF1E293B)),
              child: const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.shopping_cart, color: Color(0xFF4ADE80), size: 48),
                    SizedBox(height: 8),
                    Text("SyncPOS", style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ),
            _buildDrawerItem(context, Icons.storefront, "Noodle POS", () => Navigator.push(context, MaterialPageRoute(builder: (context) => const NoodlePosScreen()))),
            _buildDrawerItem(context, Icons.dashboard, "Dashboard", () => Navigator.pop(context), active: true),
            _buildDrawerItem(context, Icons.add_circle_outline, "New Sale", () => Navigator.push(context, MaterialPageRoute(builder: (context) => const AddTransactionScreen()))),
            _buildDrawerItem(context, Icons.history, "History", () => Navigator.push(context, MaterialPageRoute(builder: (context) => const HistoryScreen()))),
            const Spacer(),
            _buildDrawerItem(context, Icons.logout, "Logout", () {
              Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (context) => const LoginScreen()), (route) => false);
            }, color: Colors.red),
            const SizedBox(height: 16),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.1,
              children: [
                _buildStatCard(
                  "Sales",
                  "₱${provider.todayTotal.toStringAsFixed(2)}",
                  "Revenue in period",
                  Icons.attach_money,
                  [Colors.indigo, Colors.purple],
                ),
                _buildStatCard(
                  "Cost of Items",
                  "₱${(provider.todayTotal * 0.4).toStringAsFixed(2)}",
                  "Cost in period",
                  Icons.shopping_bag_outlined,
                  [Colors.orange, Colors.deepOrange],
                ),
                _buildStatCard(
                  "Gross Profit",
                  "₱${(provider.todayTotal * 0.6).toStringAsFixed(2)}",
                  "Revenue - Item ...",
                  Icons.trending_up,
                  [Colors.cyan, Colors.teal],
                ),
                _buildStatCard(
                  "Inventory Val...",
                  "₱2922.00",
                  "Total stock value",
                  Icons.inventory_2_outlined,
                  [Colors.pink, Colors.rose],
                ),
                _buildStatCard(
                  "Actual Profit",
                  "₱${(provider.todayTotal * 0.6).toStringAsFixed(2)}",
                  "Gross Profit - Ex...",
                  Icons.trending_up,
                  [Colors.emerald, Colors.teal],
                ),
                _buildStatCard(
                  "Expenses",
                  "₱0.00",
                  "Expenses in peri...",
                  Icons.account_balance_wallet_outlined,
                  [Colors.orangeAccent, Colors.redAccent],
                ),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              "Expiring Soon",
              Icons.warning_amber_rounded,
              Colors.orange,
              [
                _buildListItem("DS Ube Cheese", "Expires: 31/03/2026"),
                _buildListItem("NOB UBe stick", "Expires: 31/03/2026"),
                _buildListItem("Strawberry Yakult", "Expires: 04/04/2026"),
              ],
            ),
            const SizedBox(height: 16),
            _buildSection(
              "Low Stock",
              Icons.trending_down,
              Colors.rose,
              [],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerItem(BuildContext context, IconData icon, String title, VoidCallback onTap, {bool active = false, Color? color}) {
    return ListTile(
      leading: Icon(icon, color: color ?? (active ? const Color(0xFF4ADE80) : Colors.slate400)),
      title: Text(title, style: TextStyle(color: color ?? (active ? Colors.white : Colors.slate400), fontWeight: active ? FontWeight.bold : FontWeight.normal)),
      onTap: onTap,
    );
  }

  Widget _buildStatCard(String title, String value, String subtitle, IconData icon, List<Color> colors) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: colors),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Stack(
        children: [
          Positioned(
            right: -10,
            top: -10,
            child: Icon(icon, size: 80, color: Colors.white.withOpacity(0.1)),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), shape: BoxShape.circle),
                  child: Icon(icon, color: Colors.white, size: 20),
                ),
                const Spacer(),
                Text(title, style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 12, fontWeight: FontWeight.w500)),
                const SizedBox(height: 4),
                Text(value, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
                const SizedBox(height: 2),
                Text(subtitle, style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 10), overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection(String title, IconData icon, Color color, List<Widget> items) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B).withOpacity(0.5),
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: const Color(0xFF334155).withOpacity(0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 28),
              const SizedBox(width: 12),
              Text(title, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
            ],
          ),
          if (items.isNotEmpty) ...[
            const SizedBox(height: 24),
            ...items,
          ],
        ],
      ),
    );
  }

  Widget _buildListItem(String title, String subtitle) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.between,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(subtitle, style: const TextStyle(color: Colors.slate500, fontSize: 14)),
            ],
          ),
          const Icon(Icons.chevron_right, color: Color(0xFF334155), size: 24),
        ],
      ),
    );
  }
}
