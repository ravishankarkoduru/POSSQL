import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/transaction_model.dart';

class ApiService {
  // Replace with your actual server URL
  static const String baseUrl = 'https://your-api-server.com/api';

  Future<bool> syncTransactions(List<TransactionModel> transactions) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/sync'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'transactions': transactions.map((t) => t.toMap()).toList(),
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Sync error: $e');
      return false;
    }
  }
}
