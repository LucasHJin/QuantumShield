'use client';

import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import Image from 'next/image';

export default function LandingPage({ onSwitchToLogin, onSwitchToRegister }) {
  return (
    <div className="min-h-screen gradient-bg">
      <Header 
        showAuthButtons={true} 
        onSwitchToLogin={onSwitchToLogin} 
        onSwitchToRegister={onSwitchToRegister}
        activeAuthTab=""
      />
      
      {/* Hero Section - Centered vertically */}
      <section className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <Image
                src="/QShield.png"
                alt="QShield"
                width={96}
                height={96}
                className="rounded-xl shadow-2xl"
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Secure Document Sharing
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Share sensitive documents with military-grade quantum encryption. Protect your income statements, addresses, and personal data with post-quantum cryptography.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onSwitchToRegister}
              className="px-8 py-4 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-all duration-200 shadow-lg text-lg font-semibold"
            >
              Get Started
            </button>
            <button
              onClick={onSwitchToLogin}
              className="px-8 py-4 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-all duration-200 text-lg font-semibold"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Our quantum-resistant encryption ensures your documents remain secure even against future quantum computers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-slate-700/50 text-center">
              <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Upload & Encrypt</h3>
              <p className="text-slate-400">
                Select your sensitive document and choose a recipient. Our system automatically encrypts it using post-quantum cryptography.
              </p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-slate-700/50 text-center">
              <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Secure Transfer</h3>
              <p className="text-slate-400">
                Your encrypted document is securely transmitted using quantum-resistant key exchange protocols.
              </p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-slate-700/50 text-center">
              <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Decrypt & Access</h3>
              <p className="text-slate-400">
                Recipients can securely decrypt and access documents using their private keys, with full signature verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose Quantum Shield?</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Built with cutting-edge post-quantum cryptography to protect your data today and tomorrow.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Quantum-Resistant Encryption</h3>
                  <p className="text-slate-400">Uses Kyber (Key Encapsulation) and Dilithium (Digital Signatures) - algorithms designed to withstand quantum attacks.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Military-Grade Security</h3>
                  <p className="text-slate-400">Built with the same cryptographic standards used by government agencies and financial institutions.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Easy to Use</h3>
                  <p className="text-slate-400">Simple, intuitive interface that makes secure document sharing accessible to everyone.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Future-Proof</h3>
                  <p className="text-slate-400">Designed to remain secure even as quantum computing technology advances.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Secure Your Documents?</h2>
          <p className="text-xl text-slate-400 mb-8">
            Join thousands of users who trust Quantum Shield for their sensitive document sharing needs.
          </p>
          <button
            onClick={onSwitchToLogin}
            className="px-8 py-4 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-all duration-200 shadow-lg text-lg font-semibold"
          >
            Get Started Now
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
} 