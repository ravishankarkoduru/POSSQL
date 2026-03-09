import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _pinController = TextEditingController();
  String? _storedPin;
  bool _isCreating = false;
  String _confirmPin = "";

  @override
  void initState() {
    super.initState();
    _checkPin();
  }

  _checkPin() async {
    final prefs = await SharedPreferences.getInstance();
    // Force set PIN to 000000 as per user request
    await prefs.setString('pos_pin', '000000');
    setState(() {
      _storedPin = '000000';
      _isCreating = false;
    });
  }

  _handlePin(String val) async {
    if (_pinController.text.length < 6) {
      setState(() {
        _pinController.text += val;
      });
    }

    if (_pinController.text.length == 6) {
      if (_isCreating) {
        if (_confirmPin.isEmpty) {
          setState(() {
            _confirmPin = _pinController.text;
            _pinController.clear();
          });
        } else {
          if (_pinController.text == _confirmPin) {
            final prefs = await SharedPreferences.getInstance();
            await prefs.setString('pos_pin', _pinController.text);
            _login();
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text("PINs do not match")),
            );
            setState(() {
              _confirmPin = "";
              _pinController.clear();
            });
          }
        }
      } else {
        if (_pinController.text == _storedPin) {
          _login();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Incorrect PIN")),
          );
          setState(() {
            _pinController.clear();
          });
        }
      }
    }
  }

  _login() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const DashboardScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                "Korean Ramen",
                style: TextStyle(
                  fontSize: 48, 
                  fontWeight: FontWeight.w900, 
                  color: Color(0xFF4ADE80),
                  letterSpacing: -1.5,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _isCreating 
                  ? (_confirmPin.isEmpty ? "Create your 6-digit PIN" : "Confirm your 6-digit PIN")
                  : "Enter PIN to start shift",
                style: const TextStyle(color: Colors.slate400, fontSize: 18, fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 48),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(6, (index) {
                  bool isActive = index == _pinController.text.length;
                  bool isFilled = index < _pinController.text.length;
                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: 48,
                    height: 64,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isActive ? Colors.indigo : const Color(0xFF1E293B),
                        width: 2,
                      ),
                      color: isActive ? Colors.indigo.withOpacity(0.1) : const Color(0xFF1E293B).withOpacity(0.5),
                    ),
                    child: Center(
                      child: isFilled 
                        ? Container(width: 8, height: 8, decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.slate400))
                        : (isActive ? null : Container(width: 4, height: 4, decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFF334155)))),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 64),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 400),
                child: GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 3,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  childAspectRatio: 1.2,
                  children: [
                    ...List.generate(9, (index) => _buildNumBtn((index + 1).toString())),
                    _buildTextBtn("CLEAR", () {
                      setState(() {
                        _pinController.clear();
                        _confirmPin = "";
                      });
                    }),
                    _buildNumBtn("0"),
                    _buildIconBtn(Icons.backspace_outlined, () {
                      if (_pinController.text.isNotEmpty) {
                        setState(() {
                          _pinController.text = _pinController.text.substring(0, _pinController.text.length - 1);
                        });
                      }
                    }),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNumBtn(String val) {
    return Material(
      color: const Color(0xFF1E293B).withOpacity(0.5),
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: () => _handlePin(val),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF334155).withOpacity(0.5)),
          ),
          alignment: Alignment.center,
          child: Text(val, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white)),
        ),
      ),
    );
  }

  Widget _buildTextBtn(String label, VoidCallback onTap) {
    return Material(
      color: const Color(0xFF1E293B).withOpacity(0.5),
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF334155).withOpacity(0.5)),
          ),
          alignment: Alignment.center,
          child: Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 1.2)),
        ),
      ),
    );
  }

  Widget _buildIconBtn(IconData icon, VoidCallback onTap) {
    return Material(
      color: const Color(0xFF1E293B).withOpacity(0.5),
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF334155).withOpacity(0.5)),
          ),
          alignment: Alignment.center,
          child: Icon(icon, color: Colors.white, size: 32),
        ),
      ),
    );
  }
}
