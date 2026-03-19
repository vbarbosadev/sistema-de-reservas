package com.example.inventory.repository;

import com.example.inventory.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    /**
     * Find all reservations that contain a given item (by tombamento).
     */
    @Query("SELECT r FROM Reservation r JOIN r.items i WHERE i.tombamento = :tombamento")
    List<Reservation> findAllByItemTombamento(@Param("tombamento") String tombamento);

    /**
     * Check if any active reservation exists for a given item (by tombamento).
     */
    @Query("SELECT COUNT(r) > 0 FROM Reservation r JOIN r.items i WHERE i.tombamento = :tombamento")
    boolean existsByItemTombamento(@Param("tombamento") String tombamento);

    /**
     * Check if an item has any active reservation overlapping with the given date range.
     * Excludes a specific reservation (use 0L to skip this exclusion).
     */
    @Query("SELECT COUNT(r) > 0 FROM Reservation r JOIN r.items i " +
           "WHERE i.tombamento = :tombamento " +
           "AND r.status NOT IN ('CANCELADO', 'DEVOLVIDO') " +
           "AND r.dataInicio <= :dataFim AND r.dataFim >= :dataInicio " +
           "AND r.id <> :excludeId")
    boolean hasConflict(@Param("tombamento") String tombamento,
                        @Param("dataInicio") LocalDate dataInicio,
                        @Param("dataFim") LocalDate dataFim,
                        @Param("excludeId") Long excludeId);
}
