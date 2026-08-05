package com.tourms.enquiry.service;

import com.tourms.enquiry.dto.EnquiryReplyRequest;
import com.tourms.enquiry.dto.EnquiryRequest;
import com.tourms.enquiry.dto.EnquiryResponse;
import com.tourms.enquiry.entity.Enquiry;
import com.tourms.enquiry.entity.Wishlist;
import com.tourms.enquiry.repository.EnquiryRepository;
import com.tourms.enquiry.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EnquiryService {

    @Autowired
    private EnquiryRepository enquiryRepository;

    @Autowired
    private WishlistRepository wishlistRepository;

    // Customer: Submit enquiry linked to package
    public EnquiryResponse createEnquiry(Long userId, EnquiryRequest request) {
        Enquiry enquiry = new Enquiry();
        enquiry.setUserId(userId);
        enquiry.setUserName(request.getUserName() != null ? request.getUserName() : "Customer");
        enquiry.setUserEmail(request.getUserEmail() != null ? request.getUserEmail() : "customer@travixa.com");
        enquiry.setPackageId(request.getPackageId());
        enquiry.setPackageTitle(request.getPackageTitle());
        enquiry.setSubject(request.getSubject());
        enquiry.setMessage(request.getMessage());
        enquiry.setStatus(Enquiry.EnquiryStatus.PENDING);

        Enquiry saved = enquiryRepository.save(enquiry);
        return mapToResponse(saved);
    }

    // Customer: Get my enquiries
    public List<EnquiryResponse> getMyEnquiries(Long userId) {
        return enquiryRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // Admin: Get all enquiries
    public List<EnquiryResponse> getAllEnquiries() {
        return enquiryRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // Admin: Reply to enquiry
    public EnquiryResponse replyToEnquiry(Long enquiryId, EnquiryReplyRequest request) {
        Enquiry enquiry = enquiryRepository.findById(enquiryId)
                .orElseThrow(() -> new RuntimeException("Enquiry not found"));

        enquiry.setAdminReply(request.getAdminReply());
        enquiry.setStatus(Enquiry.EnquiryStatus.ANSWERED);

        Enquiry saved = enquiryRepository.save(enquiry);
        return mapToResponse(saved);
    }

    // Admin: Close enquiry
    public EnquiryResponse closeEnquiry(Long enquiryId) {
        Enquiry enquiry = enquiryRepository.findById(enquiryId)
                .orElseThrow(() -> new RuntimeException("Enquiry not found"));

        enquiry.setStatus(Enquiry.EnquiryStatus.CLOSED);
        Enquiry saved = enquiryRepository.save(enquiry);
        return mapToResponse(saved);
    }

    // Admin / Customer: Delete enquiry
    public void deleteEnquiry(Long enquiryId) {
        enquiryRepository.deleteById(enquiryId);
    }

    // Get enquiry by ID
    public EnquiryResponse getEnquiryById(Long id) {
        Enquiry enquiry = enquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enquiry not found"));
        return mapToResponse(enquiry);
    }

    // WISHLIST: Add package to wishlist
    public Wishlist addToWishlist(Long userId, Long packageId) {
        Optional<Wishlist> existing = wishlistRepository.findByUserIdAndPackageId(userId, packageId);
        if (existing.isPresent()) {
            return existing.get();
        }
        Wishlist wishlist = new Wishlist(userId, packageId);
        return wishlistRepository.save(wishlist);
    }

    // WISHLIST: Remove package from wishlist
    @Transactional
    public void removeFromWishlist(Long userId, Long packageId) {
        wishlistRepository.deleteByUserIdAndPackageId(userId, packageId);
    }

    // WISHLIST: Get customer's wishlist items
    public List<Wishlist> getMyWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId);
    }

    private EnquiryResponse mapToResponse(Enquiry enquiry) {
        EnquiryResponse response = new EnquiryResponse();
        response.setId(enquiry.getId());
        response.setUserId(enquiry.getUserId());
        response.setUserName(enquiry.getUserName());
        response.setUserEmail(enquiry.getUserEmail());
        response.setPackageId(enquiry.getPackageId());
        response.setPackageTitle(enquiry.getPackageTitle());
        response.setSubject(enquiry.getSubject());
        response.setMessage(enquiry.getMessage());
        response.setAdminReply(enquiry.getAdminReply());
        response.setStatus(enquiry.getStatus().name());
        response.setCreatedAt(enquiry.getCreatedAt());
        response.setUpdatedAt(enquiry.getUpdatedAt());
        return response;
    }
}
