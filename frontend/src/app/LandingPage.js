'use client';

import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import Image from 'next/image';

export default function LandingPage({ onSwitchToLogin, onSwitchToRegister, onBackToDashboard, isLoggedIn = false }) {
  return (
    <div className="min-h-screen bg-black">
      <Header 
        showAuthButtons={!isLoggedIn} 
        onSwitchToLogin={onSwitchToLogin} 
        onSwitchToRegister={onSwitchToRegister}
        onBackToDashboard={isLoggedIn ? onBackToDashboard : undefined}
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
            <p className="text-xl text-[#eadaff] max-w-3xl mx-auto leading-relaxed">
              Share sensitive documents with military-grade quantum encryption. Protect your income statements, addresses, and personal data with post-quantum cryptography.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isLoggedIn ? (
              <button
                onClick={onBackToDashboard}
                className="px-8 py-4 bg-[#3b275f] text-white rounded-lg hover:bg-[#eadaff] transition-all duration-200 shadow-lg text-lg font-semibold"
              >
                Back to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={onSwitchToRegister}
                  className="px-8 py-4 bg-[#3b275f] text-white rounded-lg hover:bg-[#eadaff] transition-all duration-200 shadow-lg text-lg font-semibold"
                >
                  Get Started
                </button>
                <button
                  onClick={onSwitchToLogin}
                  className="px-8 py-4 border border-[#eadaff] text-[#eadaff] rounded-lg hover:bg-[#3b275f]/50 transition-all duration-200 text-lg font-semibold"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-[#eadaff] max-w-2xl mx-auto">
              Our quantum-resistant encryption ensures your documents remain secure even against future quantum computers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#3b275f]/20 backdrop-blur-sm rounded-lg p-8 border border-[#eadaff]/30 text-center">
              <div className="w-16 h-16 bg-[#3b275f] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Upload & Encrypt</h3>
              <p className="text-[#eadaff]">
                Select your sensitive document and choose a recipient. Our system automatically encrypts it using post-quantum cryptography.
              </p>
            </div>
            
            <div className="bg-[#3b275f]/20 backdrop-blur-sm rounded-lg p-8 border border-[#eadaff]/30 text-center">
              <div className="w-16 h-16 bg-[#3b275f] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Secure Transfer</h3>
              <p className="text-[#eadaff]">
                Your encrypted document is securely transmitted using quantum-resistant key exchange protocols.
              </p>
            </div>
            
            <div className="bg-[#3b275f]/20 backdrop-blur-sm rounded-lg p-8 border border-[#eadaff]/30 text-center">
              <div className="w-16 h-16 bg-[#3b275f] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Decrypt & Access</h3>
              <p className="text-[#eadaff]">
                Recipients can securely decrypt and access documents using their private keys, with full signature verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#3b275f]/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose Quantum Shield?</h2>
            <p className="text-xl text-[#eadaff] max-w-2xl mx-auto">
              Built with cutting-edge post-quantum cryptography to protect your data today and tomorrow.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg border border-[#eadaff]/30">
                  <svg className="w-6 h-6 text-[#eadaff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Quantum-Resistant Encryption</h3>
                  <p className="text-[#eadaff]">Uses Kyber (Key Encapsulation) and Dilithium (Digital Signatures) - algorithms designed to withstand quantum attacks.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg border border-[#eadaff]/30">
                  <svg className="w-6 h-6 text-[#eadaff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Military-Grade Security</h3>
                  <p className="text-[#eadaff]">Built with the same cryptographic standards used by government agencies and financial institutions.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg border border-[#eadaff]/30">
                  <svg className="w-6 h-6 text-[#eadaff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Easy to Use</h3>
                  <p className="text-[#eadaff]">Simple, intuitive interface that makes secure document sharing accessible to everyone.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg border border-[#eadaff]/30">
                  <svg className="w-6 h-6 text-[#eadaff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Future-Proof</h3>
                  <p className="text-[#eadaff]">Designed to remain secure even as quantum computing technology advances.</p>
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
          <p className="text-xl text-[#eadaff] mb-8">
            Join thousands of users who trust Quantum Shield for their sensitive document sharing needs.
          </p>
          {isLoggedIn ? (
            <button
              onClick={onBackToDashboard}
              className="px-8 py-4 bg-[#3b275f] text-white rounded-lg hover:bg-[#eadaff] transition-all duration-200 shadow-lg text-lg font-semibold"
            >
              Back to Dashboard
            </button>
          ) : (
            <button
              onClick={onSwitchToLogin}
              className="px-8 py-4 bg-[#3b275f] text-white rounded-lg hover:bg-[#eadaff] transition-all duration-200 shadow-lg text-lg font-semibold"
            >
              Get Started Now
            </button>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
} 