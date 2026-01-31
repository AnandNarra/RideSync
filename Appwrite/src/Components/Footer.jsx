import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <h4 className="text-lg font-bold mb-4">RideSync</h4>
                    <p className="text-gray-400 text-sm">Sharing rides, saving the planet.</p>
                </div>
                <div>
                    <h4 className="text-sm font-bold mb-4 uppercase tracking-wider">Product</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li>Find a Ride</li>
                        <li>Publish a Ride</li>
                        <li>How it works</li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-sm font-bold mb-4 uppercase tracking-wider">Company</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li>About Us</li>
                        <li>Contact</li>
                        <li>Terms of Service</li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-sm font-bold mb-4 uppercase tracking-wider">Social</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li>Twitter</li>
                        <li>Facebook</li>
                        <li>Instagram</li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} RideSync. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
