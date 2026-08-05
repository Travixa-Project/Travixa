package com.tourms.booking.service;

import com.tourms.booking.dto.BookingRequest;
import com.tourms.booking.dto.BookingResponse;
import com.tourms.booking.entity.Booking;
import com.tourms.booking.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    // Customer: Create booking
    public BookingResponse createBooking(Long userId, BookingRequest request) {
        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setPackageId(request.getPackageId());
        booking.setPackageTitle(request.getPackageTitle());
        booking.setTravelDate(request.getTravelDate() != null ? request.getTravelDate() : java.time.LocalDate.now());
        booking.setNumberOfPersons(request.getNumberOfPersons());
        booking.setTotalAmount(request.getTotalAmount());
        booking.setSpecialRequests(request.getSpecialRequests());
        booking.setStatus(Booking.BookingStatus.PENDING_PAYMENT);

        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    // Customer: Get my bookings
    public List<BookingResponse> getMyBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // Customer: Cancel own booking
    public BookingResponse cancelMyBooking(Long userId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUserId().equals(userId)) {
            throw new RuntimeException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    // Admin: Get all bookings
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // Confirm booking (Called by Payment Service on successful payment or Admin)
    public BookingResponse confirmBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    // Admin / System: Mark booking as COMPLETED
    public BookingResponse completeBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(Booking.BookingStatus.COMPLETED);
        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    // Admin: Cancel booking
    public BookingResponse adminCancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    // Get booking by ID
    public BookingResponse getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return mapToResponse(booking);
    }

    // Check if a user has a confirmed/completed booking for a specific package
    public boolean hasConfirmedBooking(Long userId, Long packageId, Long bookingId) {
        if (bookingId != null) {
            return bookingRepository.findById(bookingId)
                    .map(b -> b.getUserId().equals(userId)
                            && b.getPackageId().equals(packageId)
                            && (b.getStatus() == Booking.BookingStatus.CONFIRMED || b.getStatus() == Booking.BookingStatus.COMPLETED))
                    .orElse(false);
        }
        return bookingRepository.findByUserId(userId).stream()
                .anyMatch(b -> b.getPackageId().equals(packageId)
                        && (b.getStatus() == Booking.BookingStatus.CONFIRMED || b.getStatus() == Booking.BookingStatus.COMPLETED));
    }

    private BookingResponse mapToResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setUserId(booking.getUserId());
        response.setPackageId(booking.getPackageId());
        response.setPackageTitle(booking.getPackageTitle());
        response.setBookingDate(booking.getBookingDate());
        response.setTravelDate(booking.getTravelDate());
        response.setNumberOfPersons(booking.getNumberOfPersons());
        response.setTotalAmount(booking.getTotalAmount());
        response.setStatus(booking.getStatus().name());
        response.setSpecialRequests(booking.getSpecialRequests());
        return response;
    }
}
