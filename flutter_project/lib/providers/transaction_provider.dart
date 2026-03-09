import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../models/transaction_model.dart';
import '../database/db_helper.dart';
import '../services/api_service.dart';

class TransactionProvider with ChangeNotifier {
  List<TransactionModel> _transactions = [];
  bool _isOnline = true;
  bool _isSyncing = false;
  final DBHelper _dbHelper = DBHelper();
  final ApiService _apiService = ApiService();

  List<TransactionModel> get transactions => _transactions;
  bool get isOnline => _isOnline;
  bool get isSyncing => _isSyncing;

  TransactionProvider() {
    _init();
  }

  void _init() {
    checkConnectivity();
    Connectivity().onConnectivityChanged.listen((ConnectivityResult result) {
      _isOnline = result != ConnectivityResult.none;
      if (_isOnline) {
        syncData();
      }
      notifyListeners();
    });
    loadTransactions();
  }

  Future<void> checkConnectivity() async {
    var result = await Connectivity().checkConnectivity();
    _isOnline = result != ConnectivityResult.none;
    notifyListeners();
  }

  Future<void> loadTransactions() async {
    _transactions = await _dbHelper.getTransactions();
    notifyListeners();
  }

  Future<void> addTransaction(TransactionModel transaction) async {
    await _dbHelper.insertTransaction(transaction);
    await loadTransactions();
    if (_isOnline) {
      syncData();
    }
  }

  Future<void> syncData() async {
    if (_isSyncing || !_isOnline) return;

    _isSyncing = true;
    notifyListeners();

    List<TransactionModel> unsynced = await _dbHelper.getUnsyncedTransactions();
    if (unsynced.isNotEmpty) {
      bool success = await _apiService.syncTransactions(unsynced);
      if (success) {
        for (var t in unsynced) {
          await _dbHelper.markAsSynced(t.id);
        }
        await loadTransactions();
      }
    }

    _isSyncing = false;
    notifyListeners();
  }

  double get todayTotal {
    final now = DateTime.now();
    return _transactions
        .where((t) => 
            t.timestamp.year == now.year && 
            t.timestamp.month == now.month && 
            t.timestamp.day == now.day)
        .fold(0, (sum, t) => sum + t.total);
  }
}
